
import begin_vertex from './ShaderChunk/begin_vertex.glsl'
import beginnormal_vertex from './ShaderChunk/beginnormal_vertex.glsl'
import color_fragment from './ShaderChunk/color_fragment.glsl'
import color_pars_fragment from './ShaderChunk/color_pars_fragment.glsl'
import color_pars_vertex from './ShaderChunk/color_pars_vertex.glsl'
import color_vertex from './ShaderChunk/color_vertex.glsl'
import common from './ShaderChunk/common.glsl'
import defaultnormal_vertex from './ShaderChunk/defaultnormal_vertex.glsl'
import emissivemap_fragment from './ShaderChunk/emissivemap_fragment.glsl'
import emissivemap_pars_fragment from './ShaderChunk/emissivemap_pars_fragment.glsl'
import texture_fragment from './ShaderChunk/texture_fragment.glsl'
import texture_pars_fragment from './ShaderChunk/texture_pars_fragment.glsl'
import metalnessmap_fragment from './ShaderChunk/metalnessmap_fragment.glsl'
import metalnessmap_pars_fragment from './ShaderChunk/metalnessmap_pars_fragment.glsl'
import normal_fragment_begin from './ShaderChunk/normal_fragment_begin.glsl'
import normal_fragment_maps from './ShaderChunk/normal_fragment_maps.glsl'
import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl'
import packing from './ShaderChunk/packing.glsl'
import project_vertex from './ShaderChunk/project_vertex.glsl'
import roughnessmap_fragment from './ShaderChunk/roughnessmap_fragment.glsl'
import roughnessmap_pars_fragment from './ShaderChunk/roughnessmap_pars_fragment.glsl'
import uv_pars_fragment from './ShaderChunk/uv_pars_fragment.glsl'
import uv_pars_vertex from './ShaderChunk/uv_pars_vertex.glsl'
import uv_vertex from './ShaderChunk/uv_vertex.glsl'

import meshphysical_frag from './ShaderLib/meshphysical_frag.glsl'
import meshphysical_vert from './ShaderLib/meshphysical_vert.glsl'

export const ShaderChunk = {
  begin_vertex: begin_vertex,
  beginnormal_vertex: beginnormal_vertex,
  color_fragment: color_fragment,
  color_pars_fragment: color_pars_fragment,
  color_pars_vertex: color_pars_vertex,
  color_vertex: color_vertex,
  common: common,
  defaultnormal_vertex: defaultnormal_vertex,
  emissivemap_fragment: emissivemap_fragment,
  emissivemap_pars_fragment: emissivemap_pars_fragment,
  texture_fragment: texture_fragment,
  texture_pars_fragment: texture_pars_fragment,
  metalnessmap_fragment: metalnessmap_fragment,
  metalnessmap_pars_fragment: metalnessmap_pars_fragment,
  normal_fragment_begin: normal_fragment_begin,
  normal_fragment_maps: normal_fragment_maps,
  normalmap_pars_fragment: normalmap_pars_fragment,
  packing: packing,
  project_vertex: project_vertex,
  roughnessmap_fragment: roughnessmap_fragment,
  roughnessmap_pars_fragment: roughnessmap_pars_fragment,
  uv_pars_fragment: uv_pars_fragment,
  uv_pars_vertex: uv_pars_vertex,
  uv_vertex: uv_vertex,

  meshphysical_frag: meshphysical_frag,
  meshphysical_vert: meshphysical_vert
}
