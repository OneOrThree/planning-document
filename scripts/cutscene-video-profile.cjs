/* Canvas JPEG의 full-range 601 계수를 명시적으로 변환한다. 원화의 sRGB 전달 특성은 유지한다. */
const filter='scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,setparams=range=limited:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709';
module.exports={
  id:'srgb-bt709-limited-v1',
  args:['-vf',filter,'-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','iec61966-2-1'],
  expected:{pix_fmt:'yuv420p',color_range:'tv',color_space:'bt709',color_transfer:'iec61966-2-1',color_primaries:'bt709'},
};
