#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;

varying vec3 vNormal;

void main() {
    float LightxNormal = dot(vNormal, directionalLights[0].direction);
    float lightIntensity = 1.0;

    vec4 camDirection = inverse(projectionViewMatrix) * vec4(0, 0, 1.0, 1.0);
    camDirection.xyz /= camDirection.w;
    
    if (LightxNormal/2.0+0.5 < 0.97) {
        lightIntensity = 1.0;
        if (LightxNormal/2.0+0.5 < 0.6) {
            lightIntensity = 0.5;
            if (LightxNormal/2.0+0.5 < 0.4) {
                lightIntensity = 0.2; 
                if (LightxNormal/2.0+0.5 < 0.15) {
                    lightIntensity = -0.3;        
                }       
            }
        }
    } else {
        lightIntensity = 3.0;
    } 
    vec3 directionalLight = directionalLights[0].color * lightIntensity;
  
    gl_FragColor = vec4(uColor * (ambientLightColor + directionalLight), 1.0);

}