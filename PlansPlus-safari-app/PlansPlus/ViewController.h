//
//  ViewController.h
//  PlansPlus
//
//  Created by Alex Cohn on 1/17/19.
//  Copyright © 2019 PlansPlus Authors. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface ViewController : NSViewController

@property (weak, nonatomic) IBOutlet NSTextField * appNameLabel;

- (IBAction)openSafariExtensionPreferences:(id)sender;

@end

