var gifs = document.querySelectorAll('a.gifs img');

for (var i = 0; i < gifs.length; i++) {

	gifs[i].addEventListener('mouseover', function(){
		this.src = this.src.replace('.png', '.gif')
	})

	gifs[i].addEventListener('mouseleave', function(){
		this.src = this.src.replace('.gif', '.png')
	})
}