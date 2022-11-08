varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
}