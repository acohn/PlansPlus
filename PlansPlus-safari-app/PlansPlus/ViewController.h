//
//  ViewController.h
//  PlansPlus
//
//  Created by Alex Cohn on 1/17/19.
//

#import <Cocoa/Cocoa.h>

@interface ViewController : NSViewController

@property (weak, nonatomic) IBOutlet NSTextField * appNameLabel;

- (IBAction)openSafariExtensionPreferences:(id)sender;

@end

