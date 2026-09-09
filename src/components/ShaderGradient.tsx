import { ShaderGradient as Gradient, ShaderGradientCanvas } from '@shadergradient/react';

export interface ShaderGradientConfig {
	animate?: 'on' | 'off'; brightness?: number; cAzimuthAngle?: number;
	cDistance?: number; cPolarAngle?: number; cameraZoom?: number;
	color1?: string; color2?: string; color3?: string;
	envPreset?: 'city' | 'dawn' | 'lobby'; fov?: number; grain?: 'on' | 'off';
	lightType?: '3d' | 'env'; pixelDensity?: number; positionX?: number;
	positionY?: number; positionZ?: number; range?: 'enabled' | 'disabled';
	rangeEnd?: number; rangeStart?: number; reflection?: number;
	rotationX?: number; rotationY?: number; rotationZ?: number; shader?: string;
	type?: 'plane' | 'sphere' | 'waterPlane'; uAmplitude?: number;
	uDensity?: number; uFrequency?: number; uSpeed?: number; uStrength?: number;
	uTime?: number; wireframe?: boolean;
}

interface Props { config?: ShaderGradientConfig; }

const defaults: ShaderGradientConfig = {
	animate: 'on', brightness: 1.2, cAzimuthAngle: 180, cDistance: 3.6,
	cPolarAngle: 90, cameraZoom: 1, 
	color1: '#544f55',
	color2: '#878086',
	color3: '#fdf7ff',
	envPreset: 'city', fov: 45, grain: 'on',
	lightType: '3d', pixelDensity: 1, positionX: -1.4, positionY: 0,
	positionZ: 0, range: 'disabled', rangeEnd: 40, rangeStart: 0,
	reflection: 0.1, rotationX: 0, rotationY: 10, rotationZ: 50,
	shader: 'defaults', type: 'plane', uAmplitude: 1, uDensity: 1.3,
	uFrequency: 5.5, uSpeed: 0.4, uStrength: 4, uTime: 0, wireframe: false,
};

export default function ShaderGradient({ config = {} }: Props) {
	const settings = { ...defaults, ...config };
	const { pixelDensity, fov, ...gradientSettings } = settings;

	return (
		<div className="shader-gradient-shell">
			<ShaderGradientCanvas className="shader-gradient" pixelDensity={pixelDensity}
				fov={fov} pointerEvents="none" lazyLoad powerPreference="high-performance">
				<Gradient control="props" {...gradientSettings} />
			</ShaderGradientCanvas>
			<span className="shader-gradient-reveal" aria-hidden="true" />
		</div>
	);
}
