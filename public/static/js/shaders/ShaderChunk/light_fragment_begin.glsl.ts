export default `
GeometricContext geometry;

geometry.position = - vMVPosition.xyz;
geometry.normal = normal;
geometry.viewDir = normalize( vMVPosition.xyz );

IncidentLight directLight;
ReflectedLight reflectedLight;

#if NUM_DIR_LIGHTS > 0

  DirectionalLight directionalLight;

  for(int i = 0; i < NUM_DIR_LIGHTS; i++){
    directionalLight = directionalLights[i];
    getDirectionalDirectLightIrradiance(directionalLight, directLight);
    CalculateLight_Physical(directLight, geometry, material, reflectedLight);
  }

#endif
`
