//
//  ViewController.m
//  AdtomaFusionSDKExample
//
//  Created by mysza on 30/03/16.
//  Copyright © 2016 Adtoma AB. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()
@property (weak, nonatomic) IBOutlet AFAdView *fusionAdView;
@property (weak, nonatomic) IBOutlet UIButton *btnLoadAd;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *constraintAdViewHeight;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    // set yourself as a delegate
    self.fusionAdView.delegate = self;
    
    // set up server address, media zone, layout and space name
    self.fusionAdView.adServerAddress = @"se-02.adtomafusion.com";
    self.fusionAdView.adMediaZone = @"mobilesdkdemo.demo";
    self.fusionAdView.adLayout = @"MobSDK_1";
    self.fusionAdView.adSpaceName = @"SDK_top";
    
    // example of setting custom parameters
    [self.fusionAdView setFusionParameter:@"singleValueParam" withValue:@"paramValue" reloadIfNeeded:YES];
    [self.fusionAdView setFusionParameter:@"multipleValuesParam" withValues:[NSArray arrayWithObjects:@"val1", @"val2", @"val3", nil] reloadIfNeeded:YES];
    
    // set to NO if no close indicator should be visible
    self.fusionAdView.showCloseIndicatorOnBannerAds = YES;
}

- (UIViewController *) adViewController {
    return self;
}

- (IBAction)onLoadAd:(id)sender {
    [self.fusionAdView loadAd];
}

// respond to creative size change notification - resize the fusionAdView
- (void)adView:(AFAdView *)adView willResizeToCreativeSize:(CGSize)creativeSize withAnimation:(BOOL)animated {
    
    if (animated) {
        [UIView animateWithDuration:0.1 animations:^{
            self.constraintAdViewHeight.constant = creativeSize.height;
            CGRect adViewFrame = self.fusionAdView.frame;
            adViewFrame.size.height = creativeSize.height;
            adViewFrame.size.width = creativeSize.width;
            self.fusionAdView.frame = adViewFrame;
            self.fusionAdView.showCloseIndicatorOnBannerAds = YES;
            [self.view layoutIfNeeded];
        }];
    } else {
        self.constraintAdViewHeight.constant = creativeSize.height;
        CGRect adViewFrame = self.fusionAdView.frame;
        adViewFrame.size.height = creativeSize.height;
        self.fusionAdView.frame = adViewFrame;
        self.fusionAdView.showCloseIndicatorOnBannerAds = YES;
        [self.view layoutIfNeeded];
    }
}

// respond to close event of the ad - resize the fusionAdView
- (void)adViewDidClose:(AFAdView *)adView {
    [UIView animateWithDuration:0.1 animations:^{
        CGRect adViewFrame = self.fusionAdView.frame;
        adViewFrame.size.height = 0;
        self.fusionAdView.frame = adViewFrame;
        self.constraintAdViewHeight.constant = 0;
        [self.view layoutIfNeeded];
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

@end
