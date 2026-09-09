const canvas = document.querySelector<HTMLCanvasElement>("#hero-mandelbrot");

if (!canvas) {
    throw new Error("No se encontro el canvas del fondo Mandelbrot.");
}

const ctx = canvas.getContext("2d", { alpha: false });

if (!ctx) {
    throw new Error("No fue posible crear el contexto 2D del canvas.");
}

const maxIterations = 500;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_RENDER_PIXELS = 2_000_000;

let renderId = 0;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
let initialRenderComplete = false;

const hero = canvas.closest<HTMLElement>(".hero");
const navigation = document.querySelector<HTMLElement>(".site-header");

function updateHeroHeight() {
    if (!hero) return;

    const navigationHeight = navigation?.getBoundingClientRect().height ?? 0;
    hero.style.setProperty("--navigation-height", `${navigationHeight}px`);
}

/**
 * Pick a new view near one of several interesting points on the boundary.
 * The logarithmic zoom gives an even mix of wide and detailed views.
 */
function randomVisualizationArea() {
    const boundaryPoints = [
        { real: -0.743643887, imaginary: 0.131825904 },
        { real: -0.101096364, imaginary: 0.95628651 },
        { real: -1.25066, imaginary: 0.02012 },
        { real: -0.7453, imaginary: 0.1127 },
        { real: -0.16, imaginary: 1.0405 },
        { real: -1.7688, imaginary: 0.0017 },
        { real: 0.285, imaginary: 0.01 }
    ];

    const point = boundaryPoints[Math.floor(Math.random() * boundaryPoints.length)];
    const zoom = 2 ** (1 + Math.random() * 10);
    const spanImaginary = 3 / zoom;

    return {
        centerReal: point.real + (Math.random() - 0.5) * spanImaginary * 0.35,
        centerImaginary: point.imaginary + (Math.random() - 0.5) * spanImaginary * 0.35,
        spanImaginary
    };
}

// A new area is selected once per page load. Resizing keeps that same view.
let visualizationArea = randomVisualizationArea();

function updateVisualizationDetails() {
    const details = document.querySelector<HTMLElement>(".fractal-details");
    if (!details) return;

    const zoom = 3 / visualizationArea.spanImaginary;
    const coordinatePrecision = Math.min(12, Math.max(5, Math.ceil(Math.log10(zoom)) + 3));
    const formattedZoom = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(zoom);

    details.textContent = `Profundidad ${formattedZoom}× · Área x ${visualizationArea.centerReal.toFixed(coordinatePrecision)}, y ${visualizationArea.centerImaginary.toFixed(coordinatePrecision)}`;
}

let fractalConsoleLines: string[] = [];

function renderFractalConsole() {
    const consoleElement = document.querySelector<HTMLElement>("#fractal-console");
    if (!consoleElement) return;

    consoleElement.textContent = fractalConsoleLines.join("\n");
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

function resetFractalConsole(totalPixels: number, width: number, height: number) {
    fractalConsoleLines = [
        "> MANDELBROT_RENDER",
        `  BUFFER ${width} x ${height}`,
        `  LIMIT  ${maxIterations} ITERATIONS`,
        `  QUEUE  ${new Intl.NumberFormat("en-US").format(totalPixels)} POINTS`,
        "  STARTING CALCULATION..."
    ];
    renderFractalConsole();
}

function appendFractalConsole(
    percentage: number,
    completedPixels: number,
    totalPixels: number,
    cReal = visualizationArea.centerReal,
    cImaginary = visualizationArea.centerImaginary
) {
    const numberFormat = new Intl.NumberFormat("en-US");
    fractalConsoleLines.push(
        `[${String(percentage).padStart(3, " ")}%] ${numberFormat.format(completedPixels)} / ${numberFormat.format(totalPixels)}`,
        `        C ${cReal.toFixed(9)} ${cImaginary < 0 ? "-" : "+"} ${Math.abs(cImaginary).toFixed(9)}i`
    );
    renderFractalConsole();
}

function updateAdaptiveContrast(image: ImageData) {
    const canvasBounds = canvas.getBoundingClientRect();
    if (!canvasBounds.width || !canvasBounds.height) return;

    document.querySelectorAll<HTMLElement>("[data-adaptive-contrast]").forEach((element) => {
        const bounds = element.getBoundingClientRect();
        const left = Math.max(0, Math.floor((bounds.left - canvasBounds.left) / canvasBounds.width * image.width));
        const right = Math.min(image.width - 1, Math.ceil((bounds.right - canvasBounds.left) / canvasBounds.width * image.width));
        const top = Math.max(0, Math.floor((bounds.top - canvasBounds.top) / canvasBounds.height * image.height));
        const bottom = Math.min(image.height - 1, Math.ceil((bounds.bottom - canvasBounds.top) / canvasBounds.height * image.height));

        let luminance = 0;
        let samples = 0;
        const stepX = Math.max(1, Math.floor((right - left) / 24));
        const stepY = Math.max(1, Math.floor((bottom - top) / 12));

        for (let y = top; y <= bottom; y += stepY) {
            for (let x = left; x <= right; x += stepX) {
                luminance += image.data[(y * image.width + x) * 4];
                samples++;
            }
        }

        const useLightText = samples > 0 && luminance / samples < 145;
        element.style.setProperty("--adaptive-color", useLightText ? "#fff" : "#111");
        element.style.setProperty("--adaptive-shadow", useLightText ? "rgba(0,0,0,.8)" : "rgba(255,255,255,.85)");
    });
}

function mandelbrotIterations(cReal, cImaginary) {
    // Points in the main cardioid or the period-2 bulb cannot escape.
    const x = cReal - 0.25;
    const q = x * x + cImaginary * cImaginary;
    if (
        q * (q + x) <= 0.25 * cImaginary * cImaginary ||
        (cReal + 1) ** 2 + cImaginary ** 2 <= 0.0625
    ) {
        return { iterations: maxIterations, magnitudeSquared: 0 };
    }

    let zReal = 0;
    let zImaginary = 0;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const zRealSquared = zReal * zReal;
        const zImaginarySquared = zImaginary * zImaginary;
        const nextImaginary = 2 * zReal * zImaginary + cImaginary;

        zReal = zRealSquared - zImaginarySquared + cReal;
        zImaginary = nextImaginary;

        const magnitudeSquared = zReal * zReal + zImaginary * zImaginary;
        if (magnitudeSquared > 4) {
            return { iterations: iteration + 1, magnitudeSquared };
        }
    }

    return { iterations: maxIterations, magnitudeSquared: 0 };
}

function getSmoothIteration(iterations: number, magnitudeSquared: number) {
    return iterations + 1 - Math.log2(Math.log2(Math.sqrt(magnitudeSquared)));
}

function getSmoothGrayscale(iterations, magnitudeSquared) {
    if (iterations === maxIterations) {
        return 0;
    }

    // Fractional escape counts remove the visible bands between iterations.
    const smoothIteration = getSmoothIteration(iterations, magnitudeSquared);
    const normalized = Math.max(0, Math.min(1, smoothIteration / maxIterations));

    // Keep the exterior bright while fading continuously toward the black set.
    return Math.round(255 * (1 - Math.sqrt(normalized)));
}

function resizeDrawingBuffer() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const requestedWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
    const requestedHeight = Math.max(1, Math.round(bounds.height * pixelRatio));
    const renderScale = Math.min(
        1,
        Math.sqrt(MAX_RENDER_PIXELS / (requestedWidth * requestedHeight))
    );
    const width = Math.max(1, Math.round(requestedWidth * renderScale));
    const height = Math.max(1, Math.round(requestedHeight * renderScale));

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

function renderMandelbrot() {
    resizeDrawingBuffer();

    const width = canvas.width;
    const height = canvas.height;
    const spanImaginary = visualizationArea.spanImaginary;
    const spanReal = spanImaginary * (width / height);
    const minReal = visualizationArea.centerReal - spanReal / 2;
    const maxImaginary = visualizationArea.centerImaginary + spanImaginary / 2;
    const currentRenderId = ++renderId;
    const totalPixels = width * height;
    const image = ctx.createImageData(width, height);
    const progress = document.querySelector<HTMLElement>(".fractal-progress");
    const progressLabel = progress?.querySelector<HTMLElement>("b");

    // Keep the canvas blank while calculating, then upload the completed image
    // once. Repeated full-canvas paints were considerably more expensive than
    // the particle effect was worth.
    image.data.fill(255);
    ctx.putImageData(image, 0, 0);

    let completedPixels = 0;
    let lastProgressUpdate = 0;
    let lastConsolePercentage = -5;
    let lastReal = visualizationArea.centerReal;
    let lastImaginary = visualizationArea.centerImaginary;
    resetFractalConsole(totalPixels, width, height);

    function renderParticles(timestamp: number) {
        if (currentRenderId !== renderId) return;

        const deadline = performance.now() + 11;
        while (completedPixels < totalPixels && performance.now() < deadline) {
            const pixel = completedPixels;
            const x = pixel % width;
            const y = Math.floor(pixel / width);
            const cReal = minReal + (x / width) * spanReal;
            const cImaginary = maxImaginary - (y / height) * spanImaginary;
            lastReal = cReal;
            lastImaginary = cImaginary;
            const result = mandelbrotIterations(cReal, cImaginary);
            const brightness = getSmoothGrayscale(result.iterations, result.magnitudeSquared);
            const pixelIndex = pixel * 4;

            image.data[pixelIndex] = brightness;
            image.data[pixelIndex + 1] = brightness;
            image.data[pixelIndex + 2] = brightness;
            completedPixels++;
        }

        if (timestamp - lastProgressUpdate > 80 || completedPixels === totalPixels) {
            lastProgressUpdate = timestamp;
            const percentage = Math.round((completedPixels / totalPixels) * 100);
            if (percentage >= lastConsolePercentage + 5 || completedPixels === totalPixels) {
                appendFractalConsole(percentage, completedPixels, totalPixels, lastReal, lastImaginary);
                lastConsolePercentage = percentage;
            }
            if (!initialRenderComplete && progress) {
                progress.style.setProperty("--fractal-progress", `${percentage}%`);
                if (progressLabel) progressLabel.textContent = `${percentage}%`;
            }
        }

        if (completedPixels < totalPixels) {
            requestAnimationFrame(renderParticles);
        } else {
            ctx.putImageData(image, 0, 0);
            updateAdaptiveContrast(image);

            if (!initialRenderComplete) {
                initialRenderComplete = true;
                document.documentElement.classList.remove("mandelbrot-generating");
                document.documentElement.classList.add("mandelbrot-ready");
            }
        }
    }

    requestAnimationFrame(renderParticles);
}

const resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderMandelbrot, 120);
});

resizeObserver.observe(canvas);
if (navigation) {
    const navigationObserver = new ResizeObserver(updateHeroHeight);
    navigationObserver.observe(navigation);
}
updateHeroHeight();
updateVisualizationDetails();
renderMandelbrot();

document.querySelector<HTMLButtonElement>("#generate-mandelbrot")?.addEventListener("click", () => {
    visualizationArea = randomVisualizationArea();
    updateVisualizationDetails();
    initialRenderComplete = false;
    document.documentElement.classList.remove("mandelbrot-ready");
    document.documentElement.classList.add("mandelbrot-generating");

    const progress = document.querySelector<HTMLElement>(".fractal-progress");
    progress?.style.setProperty("--fractal-progress", "0%");
    const progressLabel = progress?.querySelector<HTMLElement>("b");
    if (progressLabel) progressLabel.textContent = "0%";

    renderMandelbrot();
});
