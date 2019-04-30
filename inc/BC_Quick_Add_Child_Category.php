<?php
/**
 * Created by PhpStorm.
 * User: MYN
 * Date: 4/27/2019
 * Time: 9:21 AM
 */

class BC_Quick_Add_Child_Category
{
    function __construct()
    {

        add_filter('category_row_actions', array($this, 'add_option'), 10, 2);
        add_filter('product_cat_row_actions', array($this, 'add_option'), 10, 2);
        add_action('admin_print_scripts', array($this, 'print_js'), 10, 2);
    }

    //print the js needed
    function print_js()
    {
        global $current_screen;

        if ($current_screen->id === 'edit-category' || $current_screen->id === 'edit-product_cat')
        { ?>
            <script>

                document.addEventListener("DOMContentLoaded", function(event) {

                    var add_child_buttons = document.getElementsByClassName('bcqac-item');

                    for (var i = 0; i < add_child_buttons.length; i++)
                    {
                        add_child_buttons[i].addEventListener('click', function(e){
                            e.preventDefault();
                            //set the parent category to the current parent category
                            var parent_id = this.getAttribute('data-parent-id');
                            var parent_select = document.getElementById("parent");
                            parent_select.value = parent_id;

                        });
                    }

                });



            </script>
        <?php }
    }

    public function add_option($actions, $tag)
    {
        $actions['add_child'] = sprintf(
            '<a href="#" data-parent-id="%s" class="bcqac-item" >%s</a>',
            $tag->term_id,
            /* translators: %s: taxonomy term name */
            __( '+ child' )
        );

        return $actions;
    }

}