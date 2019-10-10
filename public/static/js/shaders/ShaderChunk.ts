
import common from './ShaderChunk/common.glsl'
import texture_fragment from './ShaderChunk/texture_fragment.glsl'
import texture_pars_fragment from './ShaderChunk/texture_pars_fragment.glsl'
import normal_fragment_begin from './ShaderChunk/normal_fragment_begin.glsl'
import normal_fragment_maps from './ShaderChunk/normal_fragment_maps.glsl'
import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl'
import metalroughnessmap_fragment from './ShaderChunk/metalroughnessmap_fragment.glsl'
import metalroughnessmap_pars_fragment from './ShaderChunk/metalroughnessmap_pars_fragment.glsl'
import aomap_fragment from './ShaderChunk/aomap_fragment.glsl'
import aomap_pars_fragment from './ShaderChunk/aomap_pars_fragment.glsl'
import emissivemap_fragment from './ShaderChunk/emissivemap_fragment.glsl'
import emissivemap_pars_fragment from './ShaderChunk/emissivemap_pars_fragment.glsl'
import uv_pars_fragment from './ShaderChunk/uv_pars_fragment.glsl'
import uv_pars_vertex from './ShaderChunk/uv_pars_vertex.glsl'
import uv_vertex from './ShaderChunk/uv_vertex.glsl'
import light_physical_fragment from './ShaderChunk/light_physical_fragment.glsl'
import light_pars_begin from './ShaderChunk/light_pars_begin.glsl'
import light_fragment_begin from './ShaderChunk/light_fragment_begin.glsl'
import light_fragment_end from './ShaderChunk/light_fragment_end.glsl'
import light_physical_pars_fragment from './ShaderChunk/light_physical_pars_fragment.glsl'
import bsdfs from './ShaderChunk/bsdfs.glsl'
import encodings_pars_fragment from './ShaderChunk/encodings_pars_fragment.glsl'
import envmap_fragment from './ShaderChunk/envmap_fragment.glsl'
import envmap_vertex from './ShaderChunk/envmap_vertex.glsl'
import envmap_pars_fragment from './ShaderChunk/envmap_pars_fragment.glsl'
import envmap_pars_vertex from './ShaderChunk/envmap_pars_vertex.glsl'
import envmap_physical_pars_fragment from './ShaderChunk/envmap_physical_pars_fragment.glsl'
import shadowmap_pars_fragment from './ShaderChunk/shadowmap_pars_fragment.glsl'
import shadowmap_pars_vertex from './ShaderChunk/shadowmap_pars_vertex.glsl'
import shadowmap_vertex from './ShaderChunk/shadowmap_vertex.glsl'
import packing from './ShaderChunk/packing.glsl'

import meshphysical_frag from './ShaderLib/meshphysical_frag.glsl'
import meshphysical_vert from './ShaderLib/meshphysical_vert.glsl'
import background_frag from './ShaderLib/background_frag.glsl'
import background_vert from './ShaderLib/background_vert.glsl'
import depth_frag from './ShaderLib/depth_frag.glsl'
import depth_vert from './ShaderLib/depth_vert.glsl'

export const ShaderChunk = {
  common: common,
  bsdfs: bsdfs,
  encodings_pars_fragment: encodings_pars_fragment,
  texture_fragment: texture_fragment,
  texture_pars_fragment: texture_pars_fragment,
  normal_fragment_begin: normal_fragment_begin,
  normal_fragment_maps: normal_fragment_maps,
  normalmap_pars_fragment: normalmap_pars_fragment,
  aomap_fragment: aomap_fragment,
  aomap_pars_fragment: aomap_pars_fragment,
  emissivemap_fragment: emissivemap_fragment,
  emissivemap_pars_fragment: emissivemap_pars_fragment,
  metalroughnessmap_pars_fragment : metalroughnessmap_pars_fragment,
  metalroughnessmap_fragment: metalroughnessmap_fragment,
  uv_pars_fragment: uv_pars_fragment,
  uv_pars_vertex: uv_pars_vertex,
  uv_vertex: uv_vertex,
  light_physical_fragment: light_physical_fragment,
  light_pars_begin: light_pars_begin,
  light_fragment_end: light_fragment_end,
  light_fragment_begin: light_fragment_begin,
  light_physical_pars_fragment: light_physical_pars_fragment,
  envmap_fragment: envmap_fragment,
  envmap_vertex: envmap_vertex,
  envmap_pars_fragment: envmap_pars_fragment,
  envmap_pars_vertex: envmap_pars_vertex,
  envmap_physical_pars_fragment: envmap_physical_pars_fragment,
  shadowmap_pars_fragment: shadowmap_pars_fragment,
  shadowmap_pars_vertex: shadowmap_pars_vertex,
  shadowmap_vertex: shadowmap_vertex,
  packing: packing,

  meshphysical_frag: meshphysical_frag,
  meshphysical_vert: meshphysical_vert,
  background_frag: background_frag,
  background_vert: background_vert,
  depth_frag: depth_frag,
  depth_vert: depth_vert
}
