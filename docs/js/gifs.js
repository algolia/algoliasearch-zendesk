
function responsiveImages () {
  var imgs = document.querySelectorAll('img.img-responsive');
  for (var i = 0; i < imgs.length; ++i) {
    var img = imgs[i];
    var cs = window.getComputedStyle(img);
    var width = parseInt(cs.width);
    var height = parseInt(cs.height);
    img.src = img.getAttribute('data-src').replace(/image\/upload/, "image/upload/w_" + width + ",h_" + height + ",c_fill")
  }
}

window.addEventListener('resize', function(event){
  responsiveImages();
});

responsiveImages();

var gifs = document.querySelectorAll('a.gifs img');
for (var i = 0; i < gifs.length; i++) {
  gifs[i].addEventListener('mouseover', function () {
    this.src = this.src.replace('.png', '.gif')
  });

  gifs[i].addEventListener('mouseleave', function () {
    this.src = this.src.replace('.gif', '.png')
  });
}
