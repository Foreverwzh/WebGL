export default `
#ifdef USE_AO

  float ambientOcclusion = ( texture2D( aoMap, vUv ).r - 1.0 ) * aoMapIntensity + 1.0;

#endif
`
