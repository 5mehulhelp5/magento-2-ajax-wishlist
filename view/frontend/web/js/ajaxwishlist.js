define([
    'jquery',
    'mage/template',
    'Magento_Ui/js/modal/alert',
    'jquery/ui',
    'mage/loader',
    'mage/url'
], function($, mageTemplate, alert, url) {
    'use strict';

    $.widget('.ajaxWishlist', {

        options: {
            addToWishlistSelector: '[data-action="add-to-wishlist"]',
            removeFromWishlistSelector: '.block-wishlist .btn-remove',
            wishlistBlockSelector: '#wishlist-view-form',
            formKeyInputSelector: 'input[name="form_key"]',
            notLoggedInErrorMessage: 'Please <a href="<%- url %>">log in</a> to be able add items to wishlist.',
            errorMessage: 'There is an error occurred while processing the request.',
            isShowSpinner: true,
            isShowSuccessMessage: true,
            customerLoginUrl: null,
            buttonClose: '.action-close'
        },

        _create: function() {
            var self = this;
            this._bind();
            this.viewWishlist();
            this.closePopup();
        },
        
        closePopup: function() {
            var seld = this;
            $(document).on('click', '#ajaxwishlist_btn_close_popup' , function() {
                $(self.options.buttonClose).trigger('click');
            })
        },

        viewWishlist: function(){
            $(document).on('click', "#wishlist_checkout", function() {
                window.location.replace('wishlist');
            })
        },
        _bind: function () {
            var selectors = [
                this.options.addToWishlistSelector,
                this.options.removeFromWishlistSelector
            ];

            $('body').on('click', selectors.join(','), $.proxy(this._processViaAjax, this));
        },

        _processViaAjax: function(event) {
            var
                post = $(event.currentTarget).data('post'),
                url = post.action,
                data = $.extend(post.data, {form_key: $(this.options.formKeyInputSelector).val()});
            $.ajax(url, {
                method: 'POST',
                data: data,
                showLoader: this.options.isShowSpinner
            }).done($.proxy(this._successHandler, this)).fail($.proxy(this._errorHandler, this));

            event.stopPropagation();
            event.preventDefault();
        },

        _successHandler: function(data) {
            var self = this;
            if (!data.success && data.error == 'not_logged_in') {
                alert({
                    title: 'Ajax Wishlist',
                    content: mageTemplate(this.options.notLoggedInErrorMessage, {
                        url: this.options.customerLoginUrl
                    })
                });

                return;
            }

            $(this.options.wishlistBlockSelector).replaceWith(data.wishlist);
            $('body').trigger('contentUpdated');

            if (this.options.isShowSuccessMessage && data.message) {
                alert({
                    title: 'Ajax Wishlist',
                    content: data.message
                });
                var wishlist_autoclose_countdown = setInterval(function (wrapper) {
                    var leftTimeNode = $(document).find('#ajaxwishlist_btn_close_popup .wishlist-autoclose-countdown');
                    var leftTime = parseInt(leftTimeNode.text()) - 1;                   
                    leftTimeNode.text(leftTime);
                    if (leftTime <= 0) {
                        $(self.options.buttonClose).trigger('click').fadeOut('slow');
                        clearInterval(wishlist_autoclose_countdown);
                        
                        
                    }
                }, 1000);
                self.viewWishlist();
            }
        },

        _errorHandler: function () {
            alert({
                title: 'Ajax Wishlist',
                content: mageTemplate(this.options.errorMessage)
            });
        }

    });

    return $.ajaxWishlist;

});
