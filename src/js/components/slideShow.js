{
  var slideIndex = 0;
  showSlides();

  function showSlides() {
    var i;
    var slides = document.getElementsByClassName('mySlides');
    var dots = document.getElementsByClassName('dot');
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1;}
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(' active', '');
    }
    slides[slideIndex-1].style.display = 'block';
    dots[slideIndex-1].className += ' active';
    setTimeout(showSlides, 3000); // Change image every 2 seconds
  }

  const orderOnline = document.getElementsByClassName('item-1');
  const bookTable = document.getElementsByClassName('item-2');
  // eslint-disable-next-line no-unused-vars
  let windowOpen = '';
  for (var i = 0 ; i < orderOnline.length; i++) {
    orderOnline[i].addEventListener('click' , function (){
      windowOpen = window.open('/#/order');
    });
  }
  for (var j = 0 ; j < bookTable.length; j++) {
    bookTable[j].addEventListener('click' , function (){
      windowOpen = window.open('/#/booking');
    });
  }
}
