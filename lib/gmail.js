const jQuery = require('jquery');

function Gmail() {
  this.gmailRootUrl = 'https://mail.google.com/mail/u/[0-9]+/';

  this.logoutButton = jQuery('#gb_71.gb_Ba.gb_vd.gb_Cd.gb_9a');
}

Gmail.prototype.logout = function() {
  this.logoutButton[0].click();
};

Gmail.prototype.navigateTo = function(place) {
  let root = window.location.href.match(this.gmailRootUrl);
  if (root) {
    root = root[0];
    window.location.href = root + '#' + place;
  }
};

module.exports = Gmail;
