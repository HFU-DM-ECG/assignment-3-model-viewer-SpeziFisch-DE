#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;

varying vec3 vNormal;

void main() {
    float NdotL = dot(vNormal, directionalLights[0].direction);
    float lightIntensity = NdotL/2.0+0.5;
    if (lightIntensity<0.5) {
        if (lightIntensity<0.3) {
            lightIntensity = 0.3;        
        }
    lightIntensity = 0.5;
    } else {
        lightIntensity = 1;
    }
    vec3 directionalLight = directionalLights[0].color * lightIntensity;
  
    gl_FragColor = vec4(uColor * (ambientLightColor + directionalLight), 1.0);

}