<style>
	label, input {
		display: block;
	}

	input[type=text] {
		width: 400px;
		height: 34px;
		border: 1px solid #aabbcc;
	}
	
	textarea {
		width: 400px;
		height: 300px;
	}


</style>


<form method="post" action="">
	<label>Plugin name</label>
	<input type="text" name="plugin_name" />
	
	<label>Plugin unique prefix</label>
	<input type="text" name="plugin_prefix" />

	<label>Plugin slug</label>
	<input type="text" name="plugin_slug" />
	<label>Plugin description</label>
	<textarea name="plugin_description"></textarea>	
	

	<input type="submit" name="submit" value="submit now" />	



</form>

<?php

if (isset($_POST['submit']))
{
	$plugin_name = $_POST['plugin_name'];
	$plugin_slug = $_POST['plugin_slug'];
	$plugin_prefix = str_ireplace(" ", "_", $_POST['plugin_prefix']);
	$plugin_description = $_POST['plugin_description'];
	
	$prefix_upper_case = strtoupper($plugin_prefix) . '_';

	$prefix_lower_case = strtolower($plugin_prefix) . '_';

	//rename plugin constants
	//
	$functions_file_content = file_get_contents('functions.php');
	$config_file_content = file_get_contents('inc/config.php');	

	//replace constants in config file
	//
	$config_file_content = str_replace('MIN_WP_NAME', $prefix_upper_case . 'NAME', $config_file_content);

	//replace the plugin name 
	//
	$config_file_content = str_replace('Min WP Starter', $plugin_name, $config_file_content);

	$config_file_content = str_replace('MIN_WP_PREFIX', $prefix_upper_case, $config_file_content);

	$config_file_content = str_replace('min_wp_', $prefix_lower_case, $config_file_content);

	//replace slug
	$config_file_content = str_replace('MIN_WP_SLUG', $prefix_upper_case . 'SLUG', $config_file_content);

	$config_file_content = str_replace('min_wp_slug', $plugin_slug, $config_file_content);
	
	//write file
	$fh_config = fopen('inc/config.php', 'w');
	fwrite($fh_config, $config_file_content);
	fclose($fh_config);


	//write functions file
	//
	$functions_file_content = str_replace('min_wp_main_add_menu', $prefix_lower_case . 'main_add_menu', $functions_file_content);


	$functions_file_content = str_replace('min_wp_main_ui', $prefix_lower_case . 'main_ui', $functions_file_content);

	$functions_file_content = str_replace('min_wp_load_backend_scripts', $prefix_lower_case . 'load_backend_scripts', $functions_file_content);


	$functions_file_content = str_replace('min_wp_load_frontend_scripts', $prefix_lower_case . 'load_frontend_scripts', $functions_file_content);

	$functions_file_content = str_replace('MIN_WP_PREFIX', $prefix_upper_case, $functions_file_content);


	$functions_file_content = str_replace('MIN_WP_NAME', $prefix_upper_case. 'NAME', $functions_file_content); 


	$functions_file_content = str_replace('MIN_WP_SLUG', $prefix_upper_case. 'SLUG', $functions_file_content); 

	$fh_functions = fopen('functions.php', 'w');
	fwrite($fh_functions, $functions_file_content);
	fclose($fh_functions);


	$index_file_content = file_get_contents('index.php');

	$index_file_content = str_replace('MIN WP NAME', $plugin_name, $index_file_content);

	$index_file_content = str_replace('plugin_description', $plugin_description, $index_file_content);

	$fh_index = fopen('index.php', 'w');
	fwrite($fh_index, $index_file_content);

	fclose($fh_index);






}
