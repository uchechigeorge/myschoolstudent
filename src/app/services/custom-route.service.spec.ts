import { TestBed } from '@angular/core/testing';

import { CustomRouteService } from './custom-route.service';

describe('CustomRouteService', () => {
  let service: CustomRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
