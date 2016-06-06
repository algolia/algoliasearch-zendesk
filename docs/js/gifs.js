function responsiveImages () {
  var imgs = document.querySelectorAll('img.img-responsive');
  for (var i = 0; i < imgs.length; ++i) {
    var img = imgs[i];
    var cs = window.getComputedStyle(img);
    var width = parseInt(cs.width) * (window.devicePixelRatio || 1);
    img.src = img.getAttribute('data-src').replace(/image\/upload/, "image/upload/w_" + width + ",c_fill")
  }
}

window.addEventListener('resize', function(event){
  responsiveImages();
});

responsiveImages();

var gifs = document.querySelectorAll('.showcase.gif');
for (var i = 0; i < gifs.length; i++) {
  (function (gif, mainImg) {
    gif.addEventListener('mouseenter', function () {
      mainImg.setAttribute('data-old-src', mainImg.src);
      mainImg.src = gif.querySelector('img.animated-image').src;
    });

    gif.addEventListener('mouseleave', function () {
      mainImg.src = mainImg.getAttribute('data-old-src');
    });
  }(gifs[i], gifs[i].querySelector('img.main-image')));
}
