/*
 * Copyright (c) 2016-2019 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 *
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClrAxis } from '../enums/axis.enum';
import { ClrSide } from '../enums/side.enum';
import { ClrSmartPosition } from '../interfaces/smart-position.interface';
import { ClrSmartPopoverEventsService } from './smart-popover-events.service';
import { ClrSmartPopoverPositionService } from './smart-popover-position.service';
import { ClrSmartPopoverToggleService } from './smart-popover-toggle.service';
import { ClrAlignment } from '@clr/angular';

@Component({
  selector: 'test-host',
  template: `
      <button #anchor class="btn">Anchor</button>
  `,
  providers: [ClrSmartPopoverEventsService, ClrSmartPopoverPositionService, ClrSmartPopoverToggleService],
})
class TestHost {
  @ViewChild('anchor', { read: ElementRef })
  anchor: ElementRef;
}

interface TestContext {
  fixture: ComponentFixture<TestHost>;
  eventService: ClrSmartPopoverEventsService;
  positionService: ClrSmartPopoverPositionService;
}

export default function(): void {
  describe('ClrSmartPopoverPositionService', function() {
    beforeEach(function(this: TestContext) {
      TestBed.configureTestingModule({
        declarations: [TestHost],
        providers: [ClrSmartPopoverEventsService, ClrSmartPopoverPositionService, ClrSmartPopoverToggleService],
      });
      this.fixture = TestBed.createComponent(TestHost);
      this.eventService = this.fixture.debugElement.injector.get(ClrSmartPopoverEventsService, null);
      this.positionService = new ClrSmartPopoverPositionService(this.eventService, 'browser');
    });

    describe('API', () => {
      it('sets a position for the popover complex', function(this: TestContext) {
        const testPosition: ClrSmartPosition = {
          anchor: null,
          content: null,
          side: ClrSide.AFTER,
          axis: ClrAxis.HORIZONTAL,
        };
        expect(this.positionService.position).toBeUndefined();
        this.positionService.position = testPosition;
        expect(this.positionService.position).toBe(testPosition);
      });

      describe('handles content alignment', function(this: TestContext) {
        // let anchor: HTMLButtonElement;
        let handleVerticalAxisOneViolationSpy: jasmine.Spy;
        let handleHorizontalAxisOneViolationSpy: jasmine.Spy;
        let handleVerticalAxisTwoViolationsSpy: jasmine.Spy;
        let handleHorizontalAxisTwoViolationsSpy: jasmine.Spy;
        let popoverContent: HTMLDivElement;

        beforeEach(function(this: TestContext) {
          this.eventService.anchorButtonRef = this.fixture.componentInstance.anchor;

          handleVerticalAxisOneViolationSpy = spyOn(this.positionService as any, 'handleVerticalAxisOneViolation');
          handleHorizontalAxisOneViolationSpy = spyOn(this.positionService as any, 'handleHorizontalAxisOneViolation');
          handleVerticalAxisTwoViolationsSpy = spyOn(this.positionService as any, 'handleVerticalAxisTwoViolations');
          handleHorizontalAxisTwoViolationsSpy = spyOn(
            this.positionService as any,
            'handleHorizontalAxisTwoViolations'
          );

          popoverContent = document.createElement('div');
        });

        afterEach(function(this: TestContext) {
          document.body.removeChild(popoverContent);
        });

        it('and aligns content when visibility is 🆗', function(this: TestContext) {
          const goodPosition: ClrSmartPosition = {
            anchor: ClrAlignment.END,
            axis: ClrAxis.HORIZONTAL,
            content: ClrAlignment.START,
            side: ClrSide.AFTER,
          };

          this.positionService.position = goodPosition;
          popoverContent.style.width = '25px';
          popoverContent.style.height = '25px';
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when ClrAxis is HORIZONTAL and there is a BOTTOM ViewportViolation', function(this: TestContext) {
          // Test a BOTTOM ViewportViolation
          const bottomViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };
          this.positionService.position = bottomViolation;
          popoverContent.style.width = '25px';
          popoverContent.style.height = window.innerHeight + 'px';
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when ClrAxis is HORIZONTAL and there is LEFT ViewportViolation', function(this: TestContext) {
          const leftViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.START,
            content: ClrAlignment.START,
          };
          // Test a LEFT violation
          this.positionService.position = leftViolation;
          popoverContent.style.width = '25px';
          popoverContent.style.height = '25px';
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when ClrAxis is HORIZONTAL and there is a RIGHT ViewportViolation', function(this: TestContext) {
          // // Test a right violation
          const rightViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.CENTER,
            content: ClrAlignment.CENTER,
          };
          this.positionService.position = rightViolation;
          popoverContent.style.width = '25000px';
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when ClrAxis is HORIZONTAL and there is a TOP ViewportViolation', function(this: TestContext) {
          // Test a TOP ViewportViolation
          const topViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };
          this.positionService.position = topViolation;
          popoverContent.style.width = '25px';
          popoverContent.style.height = '250px';
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when ClrAxis is VERTICAL and there is a BOTTOM ViewportViolation', function(this: TestContext) {
          // Test a BOTTOM violataion
          const bottomViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.CENTER,
            content: ClrAlignment.CENTER,
          };

          popoverContent.style.width = '25px';
          popoverContent.style.height = window.innerHeight + 'px';
          this.positionService.position = bottomViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there is a LEFT ViewportViolation', function(this: TestContext) {
          const leftViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };
          popoverContent.style.width = '5px';
          popoverContent.style.height = '5px';
          this.positionService.position = leftViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there is a RIGHT ViewportViolation', function(this: TestContext) {
          const rightViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };
          popoverContent.style.width = window.innerWidth + 'px';
          popoverContent.style.height = '5px';
          this.positionService.position = rightViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);
          expect(handleVerticalAxisOneViolationSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there are TOP/LEFT ViewportViolation', function(this: TestContext) {
          const topRightViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };

          popoverContent.style.width = '25px';
          popoverContent.style.height = '25px';
          this.positionService.position = topRightViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there are TOP/RIGHT ViewportViolations', function(this: TestContext) {
          const topCenterViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.END,
            content: ClrAlignment.START,
          };

          popoverContent.style.width = window.innerWidth + 'px';
          popoverContent.style.height = '25px';
          this.positionService.position = topCenterViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there are BOTTOM/LEFT ViewportViolations', function(this: TestContext) {
          const bottomLeftViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };

          popoverContent.style.width = '25px';
          popoverContent.style.height = window.innerHeight + 'px';
          this.positionService.position = bottomLeftViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is VERTICAL and there are BOTTOM/RIGHT ViewportViolations', function(this: TestContext) {
          const bottomRightViolation: ClrSmartPosition = {
            axis: ClrAxis.VERTICAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.END,
            content: ClrAlignment.START,
          };

          popoverContent.style.width = window.innerWidth + 'px';
          popoverContent.style.height = window.innerHeight + 'px';
          this.positionService.position = bottomRightViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy.calls.count()).toEqual(1);
          expect(handleHorizontalAxisTwoViolationsSpy).not.toHaveBeenCalled();
        });

        it('and aligns content when Axis is HORIZONTAL and there are TOP/LEFT ViewportViolations', function(this: TestContext) {
          const topLeftViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };

          popoverContent.style.width = '25px';
          popoverContent.style.height = '25px';
          this.positionService.position = topLeftViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy.calls.count()).toEqual(1);
        });

        it('and aligns content when Axis is HORIZONTAL and there are TOP/RIGHT ViewportViolations', function(this: TestContext) {
          const topRightViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.START,
            content: ClrAlignment.END,
          };

          popoverContent.style.width = window.innerWidth + 'px';
          popoverContent.style.height = '25px';
          this.positionService.position = topRightViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy.calls.count()).toEqual(1);
        });

        it('and aligns content when Axis is HORIZONTAL and there are BOTTOM/LEFT ViewportViolations', function(this: TestContext) {
          const bottomLeftViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.BEFORE,
            anchor: ClrAlignment.END,
            content: ClrAlignment.START,
          };

          popoverContent.style.height = window.innerHeight + 'px';
          popoverContent.style.width = '25px';
          this.positionService.position = bottomLeftViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy.calls.count()).toEqual(1);
        });

        it('and aligns content when Axis is HORIZONTAL and there are BOTTOM/RIGHT ViewportViolations', function(this: TestContext) {
          const bottomRightViolation: ClrSmartPosition = {
            axis: ClrAxis.HORIZONTAL,
            side: ClrSide.AFTER,
            anchor: ClrAlignment.END,
            content: ClrAlignment.START,
          };

          popoverContent.style.height = window.innerHeight + 'px';
          popoverContent.style.width = window.innerWidth + 'px';
          this.positionService.position = bottomRightViolation;
          document.body.appendChild(popoverContent);
          this.positionService.alignContent(popoverContent);

          expect(handleVerticalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisOneViolationSpy).not.toHaveBeenCalled();
          expect(handleVerticalAxisTwoViolationsSpy).not.toHaveBeenCalled();
          expect(handleHorizontalAxisTwoViolationsSpy.calls.count()).toEqual(1);
        });
      });
    });
  });
}