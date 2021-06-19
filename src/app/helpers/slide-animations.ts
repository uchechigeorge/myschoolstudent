export class SlideAnimations{

  private _isAnimating: boolean = false;

  public get isAnimating () {
    return this._isAnimating;
  }

  constructor(private slides: HTMLElement[], activeIndex?: number) {
    if(slides.length < 1) return;

    this.slides.forEach(slide => {
      this.setSlideInactive(slide);
    });

    if(activeIndex == null) {
      this.setSlideActive(this.slides[0]);
    }
    else if(activeIndex != null && (activeIndex - 1) <= this.slides.length) {
      this.setSlideActive(this.slides[activeIndex]);
    }
  }

  public slideNext(directions?: ISlidesDirection) {
    if(this.isAnimating == true) return;

    const slideOutElem = this.slides.find((slide) => {
      const attr = slide.getAttribute('data-slide-active');
      return attr == 'true';
    });
  
    const activeAttr = slideOutElem.getAttribute('data-slide');
    if(isNaN(parseInt(activeAttr))) return;
  
    let activeIndex = parseInt(activeAttr);
    
    const slideInElem = this.slides.find(slide => {
      const attr = slide.getAttribute('data-slide');
      return attr == (activeIndex + 1).toString(); 
    });
  
    this.animateSlides(slideOutElem, slideInElem, directions == null ? null : directions);
  }

  public slidePrev(directions?: ISlidesDirection) {
    if(this.isAnimating == true) return;

    const slideOutElem = this.slides.find((slide) => {
      const attr = slide.getAttribute('data-slide-active');
      return attr == 'true';
    });
    const activeAttr = slideOutElem.getAttribute('data-slide');
    if(isNaN(parseInt(activeAttr))) return;
    let activeIndex = parseInt(activeAttr);
    const slideInElem = this.slides.find(slide => {
      const attr = slide.getAttribute('data-slide');
      return attr == (activeIndex - 1).toString(); 
    });

    this.animateSlides(slideOutElem, slideInElem, directions == null ? null : directions);
  }

  slideTo(slideNo: number) {
    if(this.isAnimating == true) return;

    const slideInElem = this.slides.find(slide => {
      const attr = slide.getAttribute('data-slide');
      return attr == slideNo.toString();
    });

    const slideOutElem = this.slides.find((slide) => {
      const attr = slide.getAttribute('data-slide-active');
      return attr == 'true';
    });

    this.animateSlides(slideOutElem, slideInElem);
  }

  animateSlides(slideOutElem: HTMLElement, slideInElem: HTMLElement, slideDirections?: ISlidesDirection) {
    if(slideInElem == null || slideOutElem == null) return;
    if(slideOutElem.getAttribute('data-slide') == slideInElem.getAttribute('data-slide')) return;
  
    let slideInDirection: AnimateDirection;
    let slideOutDirection: AnimateDirection;
  
    if(slideDirections == null) {
      const slideOutIndex = slideOutElem.getAttribute('data-slide');
      const slideInIndex = slideInElem.getAttribute('data-slide');
  
      if(slideOutIndex > slideInIndex) {
        slideInDirection = AnimateDirection.Left;
        slideOutDirection = AnimateDirection.Right;
      }
      else {
        slideInDirection = AnimateDirection.Right;
        slideOutDirection = AnimateDirection.Left;
      }
    }
    else {
      slideInDirection = slideDirections.slideInDirection;
      slideOutDirection = slideDirections.slideOutDirection;
    }

    this.animateSlideIn(slideInElem, slideInDirection);
    this.animateSlideOut(slideOutElem, slideOutDirection);
  }
  
  private animateSlideOut(elem: HTMLElement, direction?: AnimateDirection) {
    if(elem == null) return;
    if(direction == null) direction = AnimateDirection.Left;
  
    elem.setAttribute('data-slide-active', 'false');
    this._isAnimating = true;
  
    let classList = ['animate__animated', 'animate__fast'];
    if(direction == AnimateDirection.Left) {
      classList.push('animate__fadeOutLeft');
    }
    else if(direction == AnimateDirection.Right) {
      classList.push('animate__fadeOutRight');
    }
    else if(direction == AnimateDirection.Top) {
      classList.push('animate__fadeOutUp');
    }
    else if(direction == AnimateDirection.Down) {
      classList.push('animate__fadeOutDown');
    }
    else {
      classList.push('animate__fadeOutLeft');
    }
  
    elem.classList.add(...classList);
    elem.addEventListener('animationend', () => {
      elem.classList.remove(...classList);
      this.setSlide(elem);
      this._isAnimating = false;
    });
  }
  
  private animateSlideIn(elem: HTMLElement, direction?: AnimateDirection) {
    if(elem == null) return;
    if(direction == null) direction = AnimateDirection.Right;
  
    elem.parentElement.style.overflowX = 'hidden';
    elem.setAttribute('data-slide-active', 'true');
    this._isAnimating = true;

    let classList = ['animate__animated', 'animate__fast'];
    if(direction == AnimateDirection.Left) {
      classList.push('animate__fadeInLeft');
    }
    else if(direction == AnimateDirection.Right) {
      classList.push('animate__fadeInRight');
    }
    else if(direction == AnimateDirection.Top) {
      classList.push('animate__fadeInUp');
    }
    else if(direction == AnimateDirection.Down) {
      classList.push('animate__fadeInDown');
    }
    else {
      classList.push('animate__fadeInLeft');
    }
  
    this.setSlide(elem);
  
    elem.classList.add(...classList);
    elem.addEventListener('animationend', () => {
      elem.classList.remove(...classList);
      elem.parentElement.style.overflowX = 'auto';
      this._isAnimating = false;
    });
  }

  private setSlideInactive(slide: HTMLElement) {
    if(slide == null) return;
  
    slide.style.opacity = '0';
    slide.style.pointerEvents = 'none';
    slide.style.height = '0';
    slide.style.overflow = 'hidden';
    slide.setAttribute('data-slide-active', 'false');
    slide.setAttribute('tabIndex', '-1');
  }
  
  private setSlideActive(slide: HTMLElement) {
    if(slide == null) return;
  
    slide.style.opacity = '1';
    slide.style.pointerEvents = 'all';
    slide.style.height = 'auto';
    slide.style.overflow = 'auto';
    slide.setAttribute('data-slide-active', 'true');
    slide.setAttribute('tabIndex', '0');
  }
  
  private setSlide(...slides: HTMLElement[]) {
    slides.forEach(slide => {
      const active = slide.getAttribute('data-slide-active');
      if(active == 'true') {
        this.setSlideActive(slide);
      }
      else if(active == 'false') {
        this.setSlideInactive(slide);
      }
    });
  }
}

enum AnimateDirection {
  Left,
  Right,
  Top,
  Down,
}

interface ISlidesDirection{
  slideOutDirection?: AnimateDirection,
  slideInDirection?: AnimateDirection,
}