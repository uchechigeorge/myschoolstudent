import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss'],
})
export class NewsItemComponent implements OnInit, OnDestroy {

  @Input() newsContent: string = '';
  @Input() newsTitle: string = '';
  @Input() icon: string = 'newspaper';
  @Input() hasImage: boolean = false;
  @Input() imgSrc: string = '';

  public truncatedText: string = '';
  public showTruncateText: boolean = true;

  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  get truncateLimit() {
    const limit = this.mobileQuery.matches ? 150 : 400;
    let truncatedIndex = this.newsContent.indexOf(' ', limit);
    let truncatedText = this.newsContent.slice(0, truncatedIndex);
    this.truncatedText = truncatedText + ' ...';
    return limit;
  }

  get readMoreVisible() {
    return this.newsContent.length > this.truncateLimit;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
