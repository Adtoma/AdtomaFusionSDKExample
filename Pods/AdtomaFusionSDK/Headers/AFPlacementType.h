//
//  AFPlacementType.h
//  AdtomaFusionSDK
//
//  Created by mYsZa on 29.04.2014.
//  Copyright (c) 2014 Adtoma AB. All rights reserved.
//

/** The placement type of the ad.
 
 This enumeration is only valid for MRAID-compatible ads; please refer to the MRAID 2.0 documentation for details ([MRAID documentation](http://www.iab.net/mraid)).
 */
typedef NS_ENUM(NSInteger, AFPlacementType) {
    /**
     *  The ad is an interstitial ad, which means it covers all screen and is not used for resize or expand.
     *
     *  Usually used between application view during transition, e.g. between levels of a game.
     */
    kAFPlacementInterstitial,
    /**
     *  The ad is an inline ad, which means it is surrounded by usual application content. Such ads can resize and expand, if the creative use MRAID methods provided by the SDK.
     */
    kAFPlacementInline
};
