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
const visualizationArea = randomVisualizationArea();

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

function getSmoothGrayscale(iterations, magnitudeSquared) {
    if (iterations === maxIterations) {
        return 0;
    }

    // Fractional escape counts remove the visible bands between iterations.
    const smoothIteration =
        iterations + 1 - Math.log2(Math.log2(Math.sqrt(magnitudeSquared)));
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
    const image = ctx.createImageData(width, height);
    const currentRenderId = ++renderId;
    let y = 0;

    // Render in slices so a large canvas does not freeze the page.
    function renderSlice() {
        if (currentRenderId !== renderId) return;

        const deadline = performance.now() + 12;
        const firstRow = y;
        while (y < height && performance.now() < deadline) {
            const cImaginary = maxImaginary - (y / height) * spanImaginary;

            for (let x = 0; x < width; x++) {
                const cReal = minReal + (x / width) * spanReal;
                const result = mandelbrotIterations(cReal, cImaginary);
                const brightness = getSmoothGrayscale(
                    result.iterations,
                    result.magnitudeSquared
                );
                const pixelIndex = (y * width + x) * 4;

                image.data[pixelIndex] = brightness;
                image.data[pixelIndex + 1] = brightness;
                image.data[pixelIndex + 2] = brightness;
                image.data[pixelIndex + 3] = 255;
            }
            y++;
        }

        if (y > firstRow) {
            ctx.putImageData(image, 0, 0, 0, firstRow, width, y - firstRow);
        }

        if (y < height) {
            requestAnimationFrame(renderSlice);
        }
    }

    requestAnimationFrame(renderSlice);
}

const resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderMandelbrot, 120);
});

resizeObserver.observe(canvas);
renderMandelbrot();
