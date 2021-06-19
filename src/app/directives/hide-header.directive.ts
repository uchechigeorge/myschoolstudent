import { Directive, Input, Renderer2, OnInit, HostListener, AfterViewInit, AfterViewChecked } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit, AfterViewChecked {

  @Input('appHideHeader') toolbar: any = {};
  private toolbarHeight: number = 56;
  public lastY: number;

  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController,
  ) { }

  ngOnInit() {
    this.toolbar = this.toolbar.el;
    
     this.domCtrl.read(() => {
      this.toolbarHeight = this.toolbar.clientHeight;
    })
  }

  ngAfterViewChecked() {
    
    // this.domCtrl.read(() => {
    //   this.toolbarHeight = this.toolbar;
    // })

    // this.domCtrl.write(() => {
    //   this.renderer.setStyle(this.toolbar, 'transition', 'top opacity 0.1s');
    // });
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event) {
    const scrollTop = $event.detail.scrollTop;
    
    let newPosition = - (scrollTop / 5);
    if(newPosition < -this.toolbarHeight) {
      newPosition = -this.toolbarHeight;
    }
    
    let newOpacity = 1 - (newPosition / -this.toolbarHeight);
    
    // if($event.detail.scrollTop > this.lastY) {
      this.domCtrl.write(() => {
        this.renderer.setStyle(this.toolbar, 'top', `${ newPosition }px`);
        this.renderer.setStyle(this.toolbar, 'opacity', `${ newOpacity }`); 
      });
    // }
    // else {
    //   this.domCtrl.write(() => {
    //     this.renderer.setStyle(this.toolbar, 'top', `${ 0 }px`);
    //     this.renderer.setStyle(this.toolbar, 'opacity', `1`);
    //   });
    // }
      
    this.lastY = $event.detail.scrollTop;
  }

}
