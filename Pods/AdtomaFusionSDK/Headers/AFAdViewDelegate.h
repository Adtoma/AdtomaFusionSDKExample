//
//  AFAdViewDelegate.h
//  AdtomaFusionSDK
//
//  Created by mYsZa on 24.03.2014.
//  Copyright (c) 2014 Adtoma AB. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <EventKitUI/EventKitUI.h>

@class AFAdView;

/**
 During the Fusion ad load and usage, the AFAdView can notify object conforming to the AFAdViewDelegate protocol about various events triggered during ad load or during user interaction with the ad.
 
The ad view behavior can also be controlled by returing specific values from some of the notification methods.

 */
@protocol AFAdViewDelegate <NSObject>

@required

#pragma mark -
#pragma mark Required properties

/**------------------------------------------------------------
 * @name Required properties
 * ------------------------------------------------------------
 */


/** The UIViewController that is the parent of the AFAdView. The controller can be used by MRAID compatible ads for displaying external browser windows, playing video files etc.

 @return UIViewController - parent of the AFAdView
 
 */
- (UIViewController *) adViewController;


@optional

#pragma mark -
#pragma mark UIWebViewDelegate

/**------------------------------------------------------------
 * @name UIWebViewDelegate
 * ------------------------------------------------------------
 */

/**
 *  If AFAdViewDelegate responds to webViewDelegate: selector, and returns object conforming to UIWebViewDelegate, that object will be notified about
 *  events from web view displaying the ad creative (if according selectors are implemented).
 *
 *  @return Object conforming to UIWebViewDelegate that will be notified about web view events.
 */
- (id<UIWebViewDelegate>) webViewDelegate;

#pragma mark -
#pragma mark Adtoma Fusion specific notifications

/**------------------------------------------------------------
 * @name Adtoma Fusion specific notifications
 * ------------------------------------------------------------
 */

/**
 *  Notification called before the ad view will load ad.
 *
 *  @param adView The AFAdView that will load the ad.
 */
- (void)adViewWillLoadAd:(AFAdView*)adView;

/**
 *  Notification called after an ad has been loaded.
 *
 *  @param adView The AFAdView that loaded the ad.
 *  @param adId   The ID of the loaded ad.
 *  @param creativeSize The size of the creative that will be loaded.
 */
- (void)adView:(AFAdView*)adView didLoadAd:(NSString*)adId withCreativeSize:(CGSize)creativeSize;

/**
 *  Notification called in case the AFAdView instance received no ad for the call.
 *
 *  @param adView The AFAdView that was loading the ad.
 */
- (void)adViewReceivedNoAd:(AFAdView*)adView;

/**
 *  Notification called after info message from SDK javascript was received.
 *
 *  @param adView  The AFAdView that received info message.
 *  @param message The message received from javascript.
 */
- (void)adView:(AFAdView*)adView receivedInfo:(NSString*)message;

/**
 *  Notification called after error message from SDK javascript was received.
 *
 *  Receiving error does not necesarily mean that the ad will not load. If adView:didLoadAd: method was called, it means the ad will be loaded despite any errors that might be received from the javascript.
 *
 *  @param adView  The AFAdView that received error message.
 *  @param message The error message received.
 *
 */
- (void)adView:(AFAdView*)adView receivedError:(NSString*)message;

/**
 *  Notification for the application that the ad view will change its frame (for example after the ad creative size changed).
 *
 *  @param adView The AFAdView that will change frame.
 *  @param creativeSize The of the creative that the AFAdView will resize to.
 *  @param animated YES if animation is allowed, NO otherwise (see AFAdView.animateResize property).
 *
 *  @return YES if the application allows the ad view to resize; NO otherwise.
 *
 *  @warning This callback is different from adView:willResizeTo: - the latter is called only after mraid.resize() method
 *  is called in the ad creative javascript. This callback is called always when for any reason ad size will change.
 */
- (void)adView:(AFAdView*)adView willResizeToCreativeSize:(CGSize)creativeSize withAnimation:(BOOL)animated;

/**
 *  Notification for the application that the ad view has changed its frame.
 *
 *  @param adView The AFAdView that has changed frame.
 *  @param creativeSize The size AFAdView changed to.
 *
 *  @warning This callback is different from adView:didResizeTo: - the latter is called only after mraid.resize() method
 *  is called in the ad creative javascript. This callback is called always after the ad frame changed for any reason.
 */
- (void)adView:(AFAdView*)adView didResizeToCreativeSize:(CGSize)creativeSize;

#pragma mark -
#pragma mark Fullscreen notifications

/**------------------------------------------------------------
 * @name Fullscreen notifications
 * ------------------------------------------------------------
 */

/**
 *  Notification for the applicatoin that it should suspend, as the ad view will start activity that will not
 *  allow user to interact with the application.
 *
 *  @param adView The AFAdView that wants the application to suspend.
 */
- (void)appShouldSuspendForAdView:(AFAdView*)adView;

/**
 *  Notification for the application that it should resume from suspended state, as the ad view is done with activity
 *  that prevented user from using the application.
 *
 *  @param adView The AFAdView that wants the application to resume.
 */
- (void)appShouldResumeFromAdView:(AFAdView*)adView;

#pragma mark -
#pragma mark MRAID specific notifications

/**------------------------------------------------------------
 * @name MRAID specific notifications
 * ------------------------------------------------------------
 */

/**
 *  Notification called before the ad will close.
 *
 *  @param adView The AFAdView that will close.
 *
 *  @return Return YES if the client allows closing the ad, NO if the ad should not close.
 */
- (BOOL)adViewWillClose:(AFAdView*)adView;

/**
 *  Notification called after the ad has closed.
 *
 *  @param adView The AFAdView that was closed.
 */
- (void)adViewDidClose:(AFAdView*)adView;

/**
 *  Notification called before the ad will open a browser window with external URL (through mraid.open()).
 *
 *  @param adView The AFAdView that will open browser window.
 *  @param url    The URL that will be opened.
 *  @param externalBrowser Flag indicating how the ad view is planning to open a URL; YES means it will open in external browser, NO means it will open in ad view's internal browser (will not leave the application)
 *
 *  @return YES if the client wants to allow opening the browser window; NO if the ad should not open external URL.
 */
- (BOOL)adView:(AFAdView*)adView willOpenBrowserWithUrl:(NSString*)url inExternalBrowser:(BOOL)externalBrowser;

/**
 *  Notification called after the browser window with external URL opened did close.
 *
 *  @param adView The AFAdView that had browser opened.
 *  @param url    The URL of the closing browser.
 */
- (void)adView:(AFAdView*)adView didCloseBrowserWithUrl:(NSString*)url;

/**
 *  Notification called after mraid.resize() method was executed in ad creative.
 *
 *  @param adView The AFAdView that contains the creative that wants to resize.
 *  @param frame  The frame AFAdView wants to resize to; frame is relative to screen.
 *
 *  @return YES if the application allows the creative to resize to desired frame; NO otherwise.
 *  @warning This method is different from adView:willAnimateTo:. This method is only called after mraid.rasize() method
 *  was invoked in the ad creative javascript, and after YES is returned (or callback not implemented), when the ad will change its frame,
 *  adView:willAnimateTo: will be called.
*/
- (BOOL)adView:(AFAdView *)adView willResizeTo:(CGRect)frame;

/**
 *  Notification called after the AFAdView resized after the call to mraid.resize() from the ad creative.
 *
 *  @param adView The AFAdView that contains the creative that called mraid.resize().
 *  @param frame  The frame AFAdView resized to; frame is relative to screen
 *  @warning See discussion and warning of adView:willResizeTo: method.
 */
- (void)adView:(AFAdView *)adView didResizeTo:(CGRect)frame;

/**
 *  Notification called before media will be started (called through mraid.playVideo()), or when inline video starts and
 *  the creative implementation calls Fusion.SDK.inlineMediaWillStart.
 *
 *  @param adView The AFAdView that received request to play video.
 *  @param url    The video URL.
 *  @param isInline Indicates whether the event was fired by the mraid.playVideo method (value is NO), or if it was called directly by the creative (value is YES)
 *
 *  @return YES if the client wants to allow opening the video player and play the video; NO otherwise.
 *  
 *  WARNING: returning NO has no effect on inline videos (will play regardless of returned value).
 */
- (BOOL)adView:(AFAdView*)adView willStartMediaWithUrl:(NSString*)url inline:(BOOL)isInline;

/**
 *  Notification called after the video url was stopped/closed, or when inline video stops/pauses and the creative
 *  implementation calls Fusion.SDK.inlineMediaDidStop.
 *
 *  @param adView The AFAdView that was playing the video.
 *  @param url    The video URL.
 *  @param isInline Indicates whether the event was fired by the mraid.playVideo method (value is NO), or if it was called directly by the creative (value is YES)
 */
- (void)adView:(AFAdView*)adView didStopMediaWithUrl:(NSString*)url inline:(BOOL)isInline;

/**
 *  Notification for the application that ad (creative) within the ad view changed the way orientation changes are handled.
 *
 *  @param adView The AFAdView that received MRAID command.
 *  @param allows YES if the ad allows orientation changed (i.e. ad view will change orientation if device orientation change); NO otherwise.
 */
- (void)adView:(AFAdView*)adView allowsOrientationChange:(BOOL)allows;

/**
 *  Notification for the application that ad (creative) within the ad view forces orientation of the ad view regardless of the device orientation.
 *
 *  @param adView      The AFAdView that received MRAID command.
 *  @param orientation The forced orientation.
 */
- (void)adView:(AFAdView*)adView forcesOrientation:(UIInterfaceOrientationMask)orientation;

/**
 *  Notification for the application that the ad view will expand to full screen view.
 *
 *  @param adView The AFAdView that will expand.
 *
 *  @return YES if the application wants to allow expanding of the ad view; NO otherwise.
 */
- (BOOL)adViewWillExpand:(AFAdView*)adView;

/**
 *  Notification for the application that the ad view expanded to full screen view.
 *
 *  @param adView The AFAdView that expanded to full screen.
 */
- (void)adViewDidExpand:(AFAdView*)adView;

/**
 *  Notification for the application that the ad will close the expanded, full screen view.
 *
 *  @param adView The AFAdView that will close (will change size to default/initial).
 */
- (void)adViewWillCloseExpandedView:(AFAdView*)adView;

/**
 *  Notification for the application that the ad did close the expanded, full screen view.
 *
 *  @param adView The AFAdView that had closed.
 */
- (void)adViewDidCloseExpandedView:(AFAdView*)adView;

/**
 *  Notification for the application that the ad wants to create a calenar event.
 *
 *  @param adView The AFAdView that wants to create calendar event.
 *  @param event The event that ad view wants to create.
 *
 *  @return YES if the application wants to allow creating calendar event; NO otherwise.
 */
- (BOOL)adView:(AFAdView*)adView willCreateCalendarEvent:(EKEvent*)event;

/**
 *  Notification for the application that the calendar event creation screen was dismissed.
 *
 *  The fact that the calendar event creator was dismissed does not necessarily mean that the event was created.
 *
 *  @param adView The AFAdView object that brought the calendar event creator dialog.
 */
- (void)adViewDidDismissCalendarEventCreator:(AFAdView*)adView;

/**
 *  Notification for the application that the ad view failed to create a calendar event.
 *
 *  @param adView       The AFAdView that tried to create calendar event.
 *  @param errorMessage Error message.
 */
- (void)adView:(AFAdView*)adView failedCreatingCalendarEvent:(NSString*)errorMessage;

/**
 *  Implement this method if you want to override the detected SMS support of the device.
 *
 *  @return If YES is returned, the ad view checks also if the device supports SMS, and returns the result of the test to the ad;
 *  if NO is returned, the ad view does not inspect the device for SMS support and returns NO to the javascript (creative).
 */
- (BOOL)shallSupportSMS;

/**
 *  Implement this method if you want to override the detected phone support of the device.
 *
 *  @return If YES is returned, the ad view checks also if the device supports phone, and returns the result of the test to the ad;
 *  if NO is returned, the ad view does not inspect the device for phone support and returns NO to the javascript (creative).
 */
- (BOOL)shallSupportTel;

/**
 *  Implement this method if you want to override the detected calendar support of the device.
 *
 *  @return If YES is returned, the ad view checks also if the device supports calendar, and returns the result of the test to the ad;
 *  if NO is returned, the ad view does not inspect the device for calendar support and returns NO to the javascript (creative).
 */
- (BOOL)shallSupportCalendar;

/**
 *  Implement this method if you want to override the detected picture storage support of the device.
 *
 *  @return If YES is returned, the ad view checks also if the device supports picture storage, and returns the result of the test to the ad;
 *  if NO is returned, the ad view does not inspect the device for picture storage support and returns NO to the javascript (creative).
 */
- (BOOL)shallSupportStorePicture;

/**
 *  Implement this method if you want to override the detected video support of the device.
 *
 *  @return If YES is returned, the ad view checks also if the device supports video play, and returns the result of the test to the ad;
 *  if NO is returned, the ad view does not inspect the device for video play support and returns NO to the javascript (creative).
 */
- (BOOL)shallSupportInlineVideo;

@end
