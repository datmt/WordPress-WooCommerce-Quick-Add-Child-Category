(function($){
    $(document).on('click', '.wsp-add-to-cart', function(){
        let button = $(this);

        $.post($(this).attr('data-url'), {}, function(response){
            //remove the add to cart text and replace with a check mark
            button.append('<i class="fa fa-check"></i>');
            button.addClass('wsp-cart-added');
        });
    });

    $(document).on('click', '.woo-slider-pro-yith-wishlist-button', function(){
        let button = $(this);
        $.post($(this).attr('data-url'), {}, function(response){
            //remove the add to cart text and replace with a check mark

            button.addClass('wsp-wishlist-added');
        });

    });



})(jQuery);
//# sourceMappingURL=front-bundle.js.map