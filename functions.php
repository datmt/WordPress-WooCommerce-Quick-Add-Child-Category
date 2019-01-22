<?php
/**
 * Created by PhpStorm.
 * User: myn
 * Date: 9/27/18
 * Time: 11:11 AM
 */

include_once 'inc/actions.php';
include_once 'inc/config.php';

add_action('admin_menu', MIN_WP_PREFIX . 'main_add_menu');

function min_wp_main_add_menu() { add_menu_page(MIN_WP_NAME, MIN_WP_NAME, 'edit_posts', MIN_WP_SLUG, 'min_wp_main_ui'); }


function min_wp_main_ui()
{
    include_once 'ui/main-ui.php';
}


add_action('admin_enqueue_scripts', 'min_wp_load_backend_scripts', 1000);

function min_wp_load_backend_scripts()
{
    wp_register_style(MIN_WP_PREFIX . '-backend-bundle-style', plugins_url( 'bundle/css/backend.css', __FILE__ ));


    wp_register_script( MIN_WP_PREFIX . '-backend-bundle-handler', plugins_url( 'bundle/js/backend-bundle.js', __FILE__ ), array(
        'jquery',
        'jquery-ui-core',
        'jquery-effects-core',
        'jquery-ui-widget',
        'jquery-ui-draggable',
        'jquery-ui-droppable',
        'jquery-ui-sortable',
        'jquery-ui-tabs',
        'underscore',
        'backbone'
    ), false, true );
    wp_enqueue_media();
    wp_enqueue_script(MIN_WP_PREFIX . '-backend-bundle-handler', '', array(), false, true);
    wp_enqueue_style(MIN_WP_PREFIX . '-backend-bundle-style');
}




add_action('wp_enqueue_scripts', 'min_wp_load_frontend_scripts', 1000);

function min_wp_load_frontend_scripts()
{
    wp_register_style(MIN_WP_PREFIX . '-frontend-bundle-style', plugins_url( 'bundle/css/front.css', __FILE__ ));
    wp_enqueue_style(MIN_WP_PREFIX . '-frontend-bundle-style');

    wp_register_script( MIN_WP_PREFIX . '-frontend-bundle-handler', plugins_url( 'bundle/js/frontend-bundle.js', __FILE__ ), array(
        'jquery',
        'underscore',
        'backbone'
    ), false, true );

    wp_enqueue_script(MIN_WP_PREFIX . '-frontend-bundle-handler', '', array(), false, true);

}
