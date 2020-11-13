{
  var slideIndex = 0;
  showSlides();

  function showSlides() {
    var a;
    var slides = document.getElementsByClassName('mySlides');
    var dots = document.getElementsByClassName('dot');
    for (a = 0; a < slides.length; a++) {
      slides[a].style.display = 'none';
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1;}
    for (a = 0; a < dots.length; a++) {
      dots[a].className = dots[a].className.replace(' active', '');
    }
    slides[slideIndex-1].style.display = 'block';
    dots[slideIndex-1].className += ' active';
    setTimeout(showSlides, 3000); // Change image every 2 seconds
  }

  const orderOnline = document.getElementsByClassName('item-1');
  const bookTable = document.getElementsByClassName('item-2');
  // eslint-disable-next-line no-unused-vars
  let windowOpen = '';
  for (var a = 0 ; a < orderOnline.length; a++) {
    orderOnline[a].addEventListener('click' , function (){
      windowOpen = window.open('/#/order');
    });
  }
  for (var j = 0 ; j < bookTable.length; j++) {
    bookTable[j].addEventListener('click' , function (){
      windowOpen = window.open('/#/booking');
    });
  }
}
