import * as THREE from 'three';

// --- ATMOSPHERE SHADER ---
export const AtmosphereShader = {
    uniforms: {
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
        uViewVector: { value: new THREE.Vector3(0, 0, 1) },
        uColor: { value: new THREE.Color(0x3366ff) },
        uSunset: { value: new THREE.Color(0xff4400) }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uSunPosition;
        uniform vec3 uColor;
        uniform vec3 uSunset;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vec3 viewDir = normalize(-vPosition);
            vec3 normal = normalize(vNormal);

            float viewDot = dot(viewDir, normal);
            float rim = pow(0.6 - viewDot, 4.0); 

            vec3 sunDir = normalize(uSunPosition); 
            float sunDot = max(0.0, dot(normal, sunDir));
            
            float terminator = 1.0 - abs(sunDot);
            terminator = pow(terminator, 4.0); 
            
            vec3 finalColor = mix(uColor, uSunset, terminator * 0.5);
            float intensity = rim * (0.4 + 0.6 * sunDot); 
            
            gl_FragColor = vec4(finalColor, intensity * 1.5);
        }
    `
};

// --- SOLAR WIND SHADER ---
export const SolarWindShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#DFFF00') }
    },
    vertexShader: `
      uniform float uTime;
      attribute float aLength;
      attribute float aOffset;
      attribute float aSpeed;
      varying float vAlpha;
      varying float vDist;
      void main() {
        vec3 pos = position;
        vec3 dir = normalize(pos);
        float dist = length(pos);
        float speed = aSpeed * 50.0; 
        float maxDist = 1200.0; 
        float minDist = 80.0;   
        float newDist = mod(dist + (uTime * speed) + aOffset, maxDist);
        if (newDist < minDist) newDist += maxDist - minDist;
        vec3 finalPos = dir * newDist;
        vDist = newDist;
        float alphaIn = smoothstep(minDist, minDist + 150.0, newDist);
        float alphaOut = 1.0 - smoothstep(maxDist - 300.0, maxDist, newDist);
        vAlpha = alphaIn * alphaOut;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      varying float vDist;
      void main() {
        if (vAlpha < 0.01) discard;
        vec3 farColor = vec3(0.8, 0.9, 1.0);
        vec3 nearColor = uColor;
        vec3 finalColor = mix(nearColor, farColor, smoothstep(100.0, 1000.0, vDist));
        gl_FragColor = vec4(finalColor, vAlpha * 0.15); 
      }
    `
};

// --- DUST SHADER ---
export const DustShader = {
    uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uCameraPos: { value: new THREE.Vector3() }
    },
    vertexShader: `
      uniform vec3 uCameraPos;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        float boxSize = 400.0;
        vec3 offset = mod(pos - uCameraPos, boxSize) - boxSize * 0.5;
        vec3 finalPos = uCameraPos + offset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
        gl_PointSize = (1.5 / -gl_Position.z) * 100.0;
        float dist = length(offset);
        vAlpha = 1.0 - smoothstep(boxSize * 0.35, boxSize * 0.5, dist);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(uColor, vAlpha * 0.4);
      }
    `
};

// --- ACCRETION DISK SHADER (BLACK HOLE) ---
export const AccretionDiskShader = {
    uniforms: {
        time: { value: 0 },
        colorInner: { value: new THREE.Color("#ffddaa") }, 
        colorMid: { value: new THREE.Color("#ff5500") },   
        colorOuter: { value: new THREE.Color("#330000") }, 
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 colorInner;
        uniform vec3 colorMid;
        uniform vec3 colorOuter;
        varying vec2 vUv;
        float random (in vec2 _st) { return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123); }
        float noise (in vec2 _st) {
            vec2 i = floor(_st);
            vec2 f = fract(_st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        void main() {
            vec2 center = vec2(0.5);
            vec2 toCenter = vUv - center;
            float r = length(toCenter) * 2.0; 
            float theta = atan(toCenter.y, toCenter.x);
            float doppler = 1.0 + 0.6 * sin(theta + 1.5); 
            float speed = 2.0 / (r + 0.1); 
            float noiseVal = noise(vec2(r * 10.0 - time * 0.5, theta * 4.0 + time * speed));
            vec3 baseColor = mix(colorMid, colorOuter, smoothstep(0.4, 1.0, r));
            baseColor = mix(colorInner, baseColor, smoothstep(0.2, 0.4, r));
            float alpha = smoothstep(0.32, 0.35, r) * smoothstep(1.0, 0.8, r);
            vec3 finalColor = baseColor * (0.8 + 1.2 * noiseVal); 
            finalColor *= doppler; 
            gl_FragColor = vec4(finalColor * 3.0, alpha * 0.95);
        }
    `
};

// --- SUN SURFACE SHADER ---
export const SunSurfaceShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#ffaa00') }, 
    uColorB: { value: new THREE.Color('#ff3300') }, 
    uColorC: { value: new THREE.Color('#ffddaa') }, 
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPos = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vec3 pos = normalize(vPos);
      float n1 = snoise(pos * 6.0 + uTime * 0.2);
      float n2 = snoise(pos * 12.0 - uTime * 0.4);
      float n3 = snoise(pos * 24.0 + uTime * 0.5);
      float noiseSum = n1 * 0.5 + n2 * 0.3 + n3 * 0.2; 
      vec3 baseColor = mix(uColorB, uColorA, noiseSum * 0.5 + 0.5);
      float hot = smoothstep(0.3, 0.8, noiseSum);
      vec3 finalColor = mix(baseColor, uColorC, hot);
      float viewAngle = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)); 
      finalColor *= 0.8 + 0.5 * pow(viewAngle, 2.0); 
      gl_FragColor = vec4(finalColor * 2.0, 1.0);
    }
  `
};

// --- SUN ATMOSPHERE SHADER ---
export const SunAtmosphereShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffaa00') }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        void main() {
            vNormal = normal;
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            gl_FragColor = vec4(uColor, intensity * 0.8);
        }
    `
};