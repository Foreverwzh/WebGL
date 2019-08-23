export default `
uniform vec3 ambientLightColor;

#if NUM_DIR_LIGHTS > 0

  struct DirectionalLight
  {
    vec3 direction;
    vec3 color;
  };

  void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, out IncidentLight directLight ) {

    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;
    directLight.visible = true;

  }
  uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];

#endif
`
