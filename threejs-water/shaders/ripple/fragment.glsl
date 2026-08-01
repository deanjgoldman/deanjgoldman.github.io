precision highp float;

#define MAX_RIPPLES 16

uniform float uTime;
uniform vec2 uResolution;
uniform int uRippleCount;
uniform vec3 uRipples[MAX_RIPPLES]; // xy: origin in uv space [0,1], z: start time
uniform sampler2D uTiles;

varying vec2 vUv;

const float SPEED = 0.55;
const float DECAY = 0.85;
const float FREQUENCY = 70.0;
const float SHARPNESS = 350.0;
const float LIFETIME = 3.5;

float rippleHeight(vec2 p) {
  float h = 0.0;

  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= uRippleCount) break;

    vec3 r = uRipples[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > LIFETIME) continue;

    vec2 d = p - r.xy;
    d.x *= uResolution.x / uResolution.y; // keep rings circular, not elliptical
    float dist = length(d);

    float radius = age * SPEED;
    float ring = exp(-pow(dist - radius, 2.0) * SHARPNESS); // localizes to the wavefront
    float amp = exp(-age * DECAY);

    h += sin(dist * FREQUENCY - age * 14.0) * ring * amp;
  }

  return h;
}

void main() {
  vec2 uv = vUv;

  float h = rippleHeight(uv);

  float eps = 1.5 / uResolution.y;
  float hx = rippleHeight(uv + vec2(eps, 0.0)) - h;
  float hy = rippleHeight(uv + vec2(0.0, eps)) - h;

  vec3 normal = normalize(vec3(-hx, -hy, eps * 3.0));
  vec3 lightDir = normalize(vec3(0.35, 0.5, 0.8));

  float diffuse = max(dot(normal, lightDir), 0.0);
  float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 50.0);

  vec3 base = texture2D(uTiles, uv * 3.0).rgb * vec3(0.72, 0.9, 1.0);
  vec3 color = base * (0.55 + 0.45 * diffuse) + vec3(1.0) * specular;

  gl_FragColor = vec4(color, 1.0);
}
