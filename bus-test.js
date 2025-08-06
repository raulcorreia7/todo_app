/**
 * Simple test to verify the event bus is working
 */

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking bus...');
    
    // Check if bus exists
    if (typeof bus === 'undefined') {
        console.error('Bus is not defined!');
        return;
    }
    
    // Check if bus methods exist
    if (typeof bus.addEventListener !== 'function') {
        console.error('Bus addEventListener method is not defined!');
        return;
    }
    
    if (typeof bus.dispatchEvent !== 'function') {
        console.error('Bus dispatchEvent method is not defined!');
        return;
    }
    
    // Test event listener
    bus.addEventListener('test-event', function(event) {
        console.log('Test event received:', event.detail);
    });
    
    // Test event dispatch
    console.log('Dispatching test event...');
    bus.dispatchEvent(new CustomEvent('test-event', {
        detail: { message: 'Hello from bus test!' }
    }));
    
    // Test app:ready event
    bus.addEventListener('app:ready', function(event) {
        console.log('app:ready event received:', event.detail);
    });
    
    console.log('Bus test completed successfully!');
});
