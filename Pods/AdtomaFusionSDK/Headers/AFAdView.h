//
//  AFAdView.h
//  AdtomaFusionSDK
//
//  Created by mYsZa on 24.03.2014.
//  Copyright (c) 2014 Adtoma AB. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AFPlacementType.h"

@protocol AFAdViewDelegate;

/** AFAdView is the Adtoma Fusion Ad view that is capable of displaying an ad served by the Adtoma Fusion.
 
 Using AFAdView is fairly simple. You use it as any other Cocoa view, i.e. by adding it to the storyboard, or creating
 the view in code and adding it to parent view. To AFAdView function correctly, several Adtoma Fusion specific settings
 must be set before the view can display an ad.
 
 The most basic usage of AFAdView can be as follow.
 In the example below it is assumed that the controller hosting the AFAdView declares this view as a property named
 fusionAdView, and that the controller conforms to the AFAdViewDelegate.
 
    // set self as a delegate
    self.fusionAdView.delegate = self;
    // set ad server address
    self.fusionAdView.adServerAddress = @"fusion.acne.com";
    // set media zone (Adtoma Fusion specific setting)
    self.fusionAdView.adMediaZone = @"acne.mobile.main";
    // set layout used on media zone
    self.fusionAdView.adLayout = @"mobile_1";
    // set name of the space that is used to display the ad
    self.fusionAdView.adSpaceName = @"default";
 
    // set max size of the ad (used by MRAID compatible ads); not necessary if the ads provided will not be MRAID compatible
    [self fusionAdView].maxSize = self.view.frame.size;
    // load the ad
    [[self fusionAdView] loadAd];
 
 */
@interface AFAdView : UIView

#pragma mark -
#pragma mark Notification delegate

/**------------------------------------------------------------
 * @name Notifications delegate
 * ------------------------------------------------------------
 */

/** Object implementing AFAdViewDelegate to provide owning controller and receive notifications.
 
 Conforms to AFAdViewDelegate.
 
 @warning It is important to always provide a delegate for the AFAdView. The only required property of the AFAdViewDelegate protocol is [AFAdViewDelegate adViewController], and it is used in many MRAID requests.
 
 */
@property (nonatomic, assign) id<AFAdViewDelegate> delegate;

#pragma mark -
#pragma mark Required properties

/**------------------------------------------------------------
 * @name Required properties
 * ------------------------------------------------------------
 */

/** The ad server address required to load ad, without the protocol part.
 
 Example: @"fusion.adtoma.com"
 
 */
@property (nonatomic, copy) NSString *adServerAddress;

/** The ad media zone required to load ad.
 
 Example: @"acne.mainsite.mobile"
 
 */
@property (nonatomic, copy) NSString *adMediaZone;

/** The ad layout required to load ad.
 
 Example: @"default_mobile_layout"
 
 */
@property (nonatomic, copy) NSString *adLayout;

/** The space name where the creative is placed.
 
 Example: @"banner"
 
 */
@property (nonatomic, copy) NSString *adSpaceName;

#pragma mark -
#pragma mark Ad control properties

/**------------------------------------------------------------
 * @name Ad control properties
 * ------------------------------------------------------------
 */

/** The placement type of the ad in the application (inline or interstitial).
 
 This property affects only MRAID-compatible ads. Difference between inline and interstitial ads is explained in the MRAID 2.0 documentation;
 simply put, interstitial ads are full screen ads that appear between user activities (e.g. between levels in a game), and do not support expand or resize.
 
 Default value is kAFPlacementInline.
 
 */
@property (nonatomic, assign) AFPlacementType adPlacementType;

/** The maximum size the ad view can be resized to.
 
 This property affects only MRAID-compatible ads. If not set explicitely, the default max size allowed for ads is full device screen.
 
 */
@property (nonatomic, assign) CGSize maxSize;

/** Flags whether the close indicator (the x in the upper right corner) should be visible for banner ads. Default is YES.
 
 The close indicator can be disabled by setting showCloseIndicatorOnBannerAds to NO; this does not remove the close event region - 50x50 points area in the upper-right corner of the AFAdView, that allows the user to close the ad. The ad can be prevented from closing by implementing the [AFAdViewDelegate adViewWillClose:] method. If that method returns NO, the ad will not close when user taps the close event region.
 
 If close event region should not be present on banner ads, set showCloseEventRegionOnBannerAds to NO.
 
 This setting can be overriden by the ad creative; if creative calls Fusion.SDK.setCloseIndicatorVisible(false), the AFAdView assumes the ad provides
 its own close indicator, and does not display the close button (equivalent of calling showCloseEventRegionOnBannerAds = NO).
 
 */
@property (nonatomic, assign) BOOL showCloseIndicatorOnBannerAds;

/**
 *  Flags whether the close event region (50x50 area in the upper right corner of the ad) should be present for banner ads. Default is YES.
 *
 *  Setting this to NO also sets the showCloseIndicatorOnBannerAds to NO, as close indicator is part of the close event region.
 *  
 *  This setting is available for overriding by the creative - if creative calls Fusion.SDK.setCloseEventRegionPresent(false), the close event
 *  retion will be removed from banner ad. This allows fine-grained control for the creatives.
 */
@property (nonatomic, assign) BOOL showCloseEventRegionOnBannerAds;

/**
 *  Flags whether the AFAdView should monitor the location of the device (GPS), which can be provided for the ads requesting it (e.g. in case of geotargeting).
 *  
 *
 *  Default value is NO, i.e. the SDK does not track location of the device.
 */
@property (nonatomic, assign) BOOL enableDeviceLocationTracking;

/**
 *  Flag indicating whether the size of the AFAdView shall be automatically adjusted to the size of the ad creative.
 *  Default is YES, so the size of the AFAdView will be updated each time the displayed creative size changes.
 */
@property (nonatomic, assign) BOOL autoResizeToCreativeSize;

/**
 *  Flats whether the resizing of the AFAdView (for example, after ad has loaded) should be animated; default is YES.
 */
@property (nonatomic, assign) BOOL animateResize;

/**
 *  The duration of the animation that resizes the AFAdView when the creative size changes (for example, after the ad loads); default is 0.3
 *  
 *  This setting has only effect if animateResize property is set to YES.
 */
@property (nonatomic, assign) CGFloat resizeAnimationDuration;

#pragma mark -
#pragma mark Ad control methods

/**------------------------------------------------------------
 * @name Ad control methods
 * ------------------------------------------------------------
 */

/**
 *  Sets custom fusion parameter used in ad calls. Use this method if the parameter value is an array, not a stingle string (in latter case, use the setFusionParameter:withValue:reloadIfNeeded method.
 *
 *  @param name   The name of the parameter to set.
 *  @param value  The value of the parameter to set (array of objects).
 *  @param reload if YES, will reload the ad if it was already loaded to make the parameter take effect.
 */
- (void) setFusionParameter:(NSString*)name withValues:(NSArray*)value reloadIfNeeded:(BOOL)reload;

/** Sets custom Fusion parameter used in ad calls.
 
 It boils down to adding the following javascript line before loading Fusion ad:
 
 window.Fusion.parameters[name] = [value];
 
 Note: the reloadIfNeeded maye be needed if you want to set some properties after the ad has been loaded, but you want to reload the ad after all the parameters are set. In such case the call would be:
 
 setFusionParameter:@"paramA" withValue:@"paramAValue" reloadIfNeeded:NO;  // the ad will not be reloaded
 setFusionParameter:@"paramB" withValue:@"paramBValue" reloadIfNeeded:YES; // the ad will be reloaded
 
 @param name  The name of the parameter to set
 @param value The value of the parameter.
 @param reload if YES, will reload the ad if it was already loaded to make the paramter take effect
 
 */
- (void) setFusionParameter:(NSString*)name withValue:(NSString*)value reloadIfNeeded:(BOOL)reload;

/** Sets URL scheme when connecting to Fusion servers to 'https' if secure parameter is set to true.
 
 This is the default behaviour.
 
 @param secure  if YES, the connection used with be https, otherwise http
 
 */
- (void) useSecureConnection:(BOOL)secure;

/** Load the ad from Adtoma Fusion ad server, with base url set to http://fusion.adtoma.com
 *
 *  Base url is used by some payload codes to indicate the origin of the request.
 *
 */
- (void) loadAd;

/**
 *  Load the ad from Adtoma Fusion ad server, with custom base url.
 *
 *  Base url is used by some payload codes to indicate the origin of the request.
 *
 *  @param baseUrl base URL of the UIWebView displaying the ad.
 */
- (void) loadAd:(NSURL*)baseUrl;

/**
 *  Cancel the last ad load request. This method is automaticall called before loadAd, too.
 */
- (void) cancelLoadAd;

/**
 *  Close the ad view.
 */
- (BOOL) close;

#pragma mark -
#pragma mark Parent notifications

/**------------------------------------------------------------
 * @name Parent notifications
 * ------------------------------------------------------------
 */

/** Inform the AFAdView that something changed when it comes to size of the ad/screen, or that orientation changed.
 
 Call this method when ad view position changes relative to the screen (i.e. in a scroll view or after application interface orientation change).
 This is used to update current ad position known to the creative. This only affects the MRAID-compatible ads.
 
 */
- (void) updateAdSizingData;

/** Inform the AFAdView that it become visible or hidden.
 
 Call this method when ad view changes visibility on the device screen (i.e. in a scroll or tab view, or after hiding the view any other way). This is required to update the visibility information of the MRAID compliant ad.
 
 @param isVisible YES if the ad view is visible, NO otherwise.
 
 */
- (void) setAdViewVisible:(BOOL)isVisible;

#pragma mark -
#pragma mark Debug settings

/**
 *  Flag indicating whether the SDK should log debug messages (using NSLog).
 *
 *  Default value is NO, so no debug messages are printed until this property is set.
 */
@property (nonatomic, assign) BOOL logDebugMessages;

@end
