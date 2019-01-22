/*
 * Lightcase - jQuery Plugin
 * The smart and flexible Lightbox Plugin.
 *
 * @author		Cornel Boppart <cornel@bopp-art.com>
 * @copyright	Author
 *
 * @version		2.5.0 (11/03/2018)
 */

;(function ($) {

	'use strict';

	var _self = {
		cache: {},

		support: {},

		objects: {},

		/**
		 * Initializes the plugin
		 *
		 * @param	{object}	options
		 * @return	{object}
		 */
		init: function (options) {
			return this.each(function () {
				$(this).unbind('click.lightcase').bind('click.lightcase', function (event) {
					event.preventDefault();
					$(this).lightcase('start', options);
				});
			});
		},

		/**
		 * Starts the plugin
		 *
		 * @param	{object}	options
		 * @return	{void}
		 */
		start: function (options) {
			_self.origin = lightcase.origin = this;

			_self.settings = lightcase.settings = $.extend(true, {
				idPrefix: 'lightcase-',
				classPrefix: 'lightcase-',
				attrPrefix: 'lc-',
				transition: 'elastic',
				transitionOpen: null,
				transitionClose: null,
				transitionIn: null,
				transitionOut: null,
				cssTransitions: true,
				speedIn: 250,
				speedOut: 250,
				width: null,
				height: null,
				maxWidth: 800,
				maxHeight: 500,
				forceWidth: false,
				forceHeight: false,
				liveResize: true,
				fullScreenModeForMobile: true,
				mobileMatchExpression: /(iphone|ipod|ipad|android|blackberry|symbian)/,
				disableShrink: false,
				fixedRatio: true,
				shrinkFactor: .75,
				overlayOpacity: .9,
				slideshow: false,
				slideshowAutoStart: true,
				breakBeforeShow: false,
				timeout: 5000,
				swipe: true,
				useKeys: true,
				useCategories: true,
				useAsCollection: false,
				navigateEndless: true,
				closeOnOverlayClick: true,
				title: null,
				caption: null,
				showTitle: true,
				showCaption: true,
				showSequenceInfo: true,
				inline: {
					width: 'auto',
					height: 'auto'
				},
				ajax: {
					width: 'auto',
					height: 'auto',
					type: 'get',
					dataType: 'html',
					data: {}
				},
				iframe: {
					width: 800,
					height: 500,
					frameborder: 0
				},
				flash: {
					width: 400,
					height: 205,
					wmode: 'transparent'
				},
				video: {
					width: 400,
					height: 225,
					poster: '',
					preload: 'auto',
					controls: true,
					autobuffer: true,
					autoplay: true,
					loop: false
				},
				attr: 'data-rel',
				href: null,
				type: null,
				typeMapping: {
					'image': 'jpg,jpeg,gif,png,bmp',
					'flash': 'swf',
					'video': 'mp4,mov,ogv,ogg,webm',
					'iframe': 'html,php',
					'ajax': 'json,txt',
					'inline': '#'
				},
				errorMessage: function () {
					return '<p class="' + _self.settings.classPrefix + 'error">' + _self.settings.labels['errorMessage'] + '</p>';
				},
				labels: {
					'errorMessage': 'Source could not be found...',
					'sequenceInfo.of': ' of ',
					'close': 'Close',
					'navigator.prev': 'Prev',
					'navigator.next': 'Next',
 					'navigator.play': 'Play',
					'navigator.pause': 'Pause'
				},
				markup: function () {
					_self.objects.body.append(
						_self.objects.overlay = $('<div id="' + _self.settings.idPrefix + 'overlay"></div>'),
						_self.objects.loading = $('<div id="' + _self.settings.idPrefix + 'loading" class="' + _self.settings.classPrefix + 'icon-spin"></div>'),
						_self.objects.case = $('<div id="' + _self.settings.idPrefix + 'case" aria-hidden="true" role="dialog"></div>')
					);
					_self.objects.case.after(
						_self.objects.close = $('<a href="#" class="' + _self.settings.classPrefix + 'icon-close"><span>' + _self.settings.labels['close'] + '</span></a>'),
						_self.objects.nav = $('<div id="' + _self.settings.idPrefix + 'nav"></div>')
					);
					_self.objects.nav.append(
						_self.objects.prev = $('<a href="#" class="' + _self.settings.classPrefix + 'icon-prev"><span>' + _self.settings.labels['navigator.prev'] + '</span></a>').hide(),
						_self.objects.next = $('<a href="#" class="' + _self.settings.classPrefix + 'icon-next"><span>' + _self.settings.labels['navigator.next'] + '</span></a>').hide(),
						_self.objects.play = $('<a href="#" class="' + _self.settings.classPrefix + 'icon-play"><span>' + _self.settings.labels['navigator.play'] + '</span></a>').hide(),
						_self.objects.pause = $('<a href="#" class="' + _self.settings.classPrefix + 'icon-pause"><span>' + _self.settings.labels['navigator.pause'] + '</span></a>').hide()
					);
					_self.objects.case.append(
						_self.objects.content = $('<div id="' + _self.settings.idPrefix + 'content"></div>'),
						_self.objects.info = $('<div id="' + _self.settings.idPrefix + 'info"></div>')
					);
					_self.objects.content.append(
						_self.objects.contentInner = $('<div class="' + _self.settings.classPrefix + 'contentInner"></div>')
					);
					_self.objects.info.append(
						_self.objects.sequenceInfo = $('<div id="' + _self.settings.idPrefix + 'sequenceInfo"></div>'),
						_self.objects.title = $('<h4 id="' + _self.settings.idPrefix + 'title"></h4>'),
						_self.objects.caption = $('<p id="' + _self.settings.idPrefix + 'caption"></p>')
					);
				},
				onInit: {},
				onStart: {},
				onBeforeCalculateDimensions: {},
				onAfterCalculateDimensions: {},
				onBeforeShow: {},
				onFinish: {},
				onResize: {},
				onClose: {},
				onCleanup: {}
			},
			options,
			// Load options from data-lc-options attribute
			_self.origin.data ? _self.origin.data('lc-options') : {});

			_self.objects.document = $('html');
			_self.objects.body = $('body');

			// Call onInit hook functions
			_self._callHooks(_self.settings.onInit);

			_self.objectData = _self._setObjectData(this);

			_self._addElements();
			_self._open();

			_self.dimensions = _self.getViewportDimensions();
		},

		/**
		 * Getter method for objects
		 *
		 * @param	{string}	name
		 * @return	{object}
		 */
		get: function (name) {
			return _self.objects[name];
		},

		/**
		 * Getter method for objectData
		 *
		 * @return	{object}
		 */
		getObjectData: function () {
			return _self.objectData;
		},

		/**
		 * Sets the object data
		 *
		 * @param	{object}	object
		 * @return	{object}	objectData
		 */
		_setObjectData: function (object) {
		 	var $object = $(object),
				objectData = {
				this: $(object),
				title: _self.settings.title || $object.attr(_self._prefixAttributeName('title')) || $object.attr('title'),
				caption: _self.settings.caption || $object.attr(_self._prefixAttributeName('caption')) || $object.children('img').attr('alt'),
				url: _self._determineUrl(),
				requestType: _self.settings.ajax.type,
				requestData: _self.settings.ajax.data,
				requestDataType: _self.settings.ajax.dataType,
				rel: $object.attr(_self._determineAttributeSelector()),
				type: _self.settings.type || _self._verifyDataType(_self._determineUrl()),
				isPartOfSequence: _self.settings.useAsCollection || _self._isPartOfSequence($object.attr(_self.settings.attr), ':'),
				isPartOfSequenceWithSlideshow: _self._isPartOfSequence($object.attr(_self.settings.attr), ':slideshow'),
				currentIndex: $(_self._determineAttributeSelector()).index($object),
				sequenceLength: $(_self._determineAttributeSelector()).length
			};

			// Add sequence info to objectData
			objectData.sequenceInfo = (objectData.currentIndex + 1) + _self.settings.labels['sequenceInfo.of'] + objectData.sequenceLength;

			// Add next/prev index
			objectData.prevIndex = objectData.currentIndex - 1;
			objectData.nextIndex = objectData.currentIndex + 1;

			return objectData;
		},

		/**
		 * Prefixes a data attribute name with defined name from 'settings.attrPrefix'
		 * to ensure more uniqueness for all lightcase related/used attributes.
		 *
		 * @param	{string}	name
		 * @return	{string}
		 */
		_prefixAttributeName: function (name) {
			return 'data-' + _self.settings.attrPrefix + name;
		},

		/**
		 * Determines the link target considering 'settings.href' and data attributes
		 * but also with a fallback to the default 'href' value.
		 *
		 * @return	{string}
		 */
		_determineLinkTarget: function () {
			return _self.settings.href || $(_self.origin).attr(_self._prefixAttributeName('href')) || $(_self.origin).attr('href');
		},

		/**
		 * Determines the attribute selector to use, depending on
		 * whether categorized collections are beeing used or not.
		 *
		 * @return	{string}	selector
		 */
		_determineAttributeSelector: function () {
			var	$origin = $(_self.origin),
				selector = '';

			if (typeof _self.cache.selector !== 'undefined') {
				selector = _self.cache.selector;
			} else if (_self.settings.useCategories === true && $origin.attr(_self._prefixAttributeName('categories'))) {
				var	categories = $origin.attr(_self._prefixAttributeName('categories')).split(' ');

				$.each(categories, function (index, category) {
					if (index > 0) {
						selector += ',';
					}
					selector += '[' + _self._prefixAttributeName('categories') + '~="' + category + '"]';
				});
			} else {
				selector = '[' + _self.settings.attr + '="' + $origin.attr(_self.settings.attr) + '"]';
			}

			_self.cache.selector = selector;

			return selector;
		},

		/**
		 * Determines the correct resource according to the
		 * current viewport and density.
		 *
		 * @return	{string}	url
		 */
		_determineUrl: function () {
			var	dataUrl = _self._verifyDataUrl(_self._determineLinkTarget()),
				width = 0,
				density = 0,
				supportLevel = '',
				url;

			$.each(dataUrl, function (index, src) {
				switch (_self._verifyDataType(src.url)) {
					case 'video':
						var	video = document.createElement('video'),
							videoType = _self._verifyDataType(src.url) + '/' + _self._getFileUrlSuffix(src.url);

						// Check if browser can play this type of video format
						if (supportLevel !== 'probably' && supportLevel !== video.canPlayType(videoType) && video.canPlayType(videoType) !== '') {
							supportLevel = video.canPlayType(videoType);
							url = src.url;
						}
						break;
					default:
						if (
							// Check density
							_self._devicePixelRatio() >= src.density &&
							src.density >= density &&
							// Check viewport width
							_self._matchMedia()('screen and (min-width:' + src.width + 'px)').matches &&
							src.width >= width
						) {
							width = src.width;
							density = src.density;
							url = src.url;
						}
						break;
				}
			});

			return url;
		},

		/**
		 * Normalizes an url and returns information about the resource path,
		 * the viewport width as well as density if defined.
		 *
		 * @param	{string}	url	Path to resource in format of an url or srcset
		 * @return	{object}
		 */
		_normalizeUrl: function (url) {
			var srcExp = /^\d+$/;

			return url.split(',').map(function (str) {
				var src = {
					width: 0,
					density: 0
				};

				str.trim().split(/\s+/).forEach(function (url, i) {
					if (i === 0) {
						return src.url = url;
					}

					var value = url.substring(0, url.length - 1),
						lastChar = url[url.length - 1],
						intVal = parseInt(value, 10),
						floatVal = parseFloat(value);
					if (lastChar === 'w' && srcExp.test(value)) {
						src.width = intVal;
					} else if (lastChar === 'h' && srcExp.test(value)) {
						src.height = intVal;
					} else if (lastChar === 'x' && !isNaN(floatVal)) {
						src.density = floatVal;
					}
				});

				return src;
			});
		},

		/**
		 * Verifies if the link is part of a sequence
		 *
		 * @param	{string}	rel
		 * @param	{string}	expression
		 * @return	{boolean}
		 */
		_isPartOfSequence: function (rel, expression) {
			var getSimilarLinks = $('[' + _self.settings.attr + '="' + rel + '"]'),
				regexp = new RegExp(expression);

			return (regexp.test(rel) && getSimilarLinks.length > 1);
		},

		/**
		 * Verifies if the slideshow should be enabled
		 *
		 * @return	{boolean}
		 */
		isSlideshowEnabled: function () {
			return (_self.objectData.isPartOfSequence && (_self.settings.slideshow === true || _self.objectData.isPartOfSequenceWithSlideshow === true));
		},

		/**
		 * Loads the new content to show
		 *
		 * @return	{void}
		 */
		_loadContent: function () {
			if (_self.cache.originalObject) {
				_self._restoreObject();
			}

			_self._createObject();
		},

		/**
		 * Creates a new object
		 *
		 * @return	{void}
		 */
		_createObject: function () {
			var $object;

			// Create object
			switch (_self.objectData.type) {
				case 'image':
					$object = $(new Image());
					$object.attr({
						// The time expression is required to prevent the binding of an image load
						'src': _self.objectData.url,
						'alt': _self.objectData.title
					});
					break;
				case 'inline':
					$object = $('<div class="' + _self.settings.classPrefix + 'inlineWrap"></div>');
					$object.html(_self._cloneObject($(_self.objectData.url)));

					// Add custom attributes from _self.settings
					$.each(_self.settings.inline, function (name, value) {
						$object.attr(_self._prefixAttributeName(name), value);
					});
					break;
				case 'ajax':
					$object = $('<div class="' + _self.settings.classPrefix + 'inlineWrap"></div>');

					// Add custom attributes from _self.settings
					$.each(_self.settings.ajax, function (name, value) {
						if (name !== 'data') {
							$object.attr(_self._prefixAttributeName(name), value);
						}
					});
					break;
				case 'flash':
					$object = $('<embed src="' + _self.objectData.url + '" type="application/x-shockwave-flash"></embed>');

					// Add custom attributes from _self.settings
					$.each(_self.settings.flash, function (name, value) {
						$object.attr(name, value);
					});
					break;
				case 'video':
					$object = $('<video></video>');
					$object.attr('src', _self.objectData.url);

					// Add custom attributes from _self.settings
					$.each(_self.settings.video, function (name, value) {
						$object.attr(name, value);
					});
					break;
				default:
					$object = $('<iframe></iframe>');
					$object.attr({
						'src': _self.objectData.url
					});

					// Add custom attributes from _self.settings
					$.each(_self.settings.iframe, function (name, value) {
						$object.attr(name, value);
					});
					break;
			}

			_self._addObject($object);
			_self._loadObject($object);
		},

		/**
		 * Adds the new object to the markup
		 *
		 * @param	{object}	$object
		 * @return	{void}
		 */
		_addObject: function ($object) {
			// Add object to content holder
			_self.objects.contentInner.html($object);

			// Start loading
			_self._loading('start');

			// Call onStart hook functions
			_self._callHooks(_self.settings.onStart);

			// Add sequenceInfo to the content holder or hide if its empty
			if (_self.settings.showSequenceInfo === true && _self.objectData.isPartOfSequence) {
				_self.objects.sequenceInfo.html(_self.objectData.sequenceInfo);
				_self.objects.sequenceInfo.show();
			} else {
				_self.objects.sequenceInfo.empty();
				_self.objects.sequenceInfo.hide();
			}
			// Add title to the content holder or hide if its empty
			if (_self.settings.showTitle === true && _self.objectData.title !== undefined && _self.objectData.title !== '') {
				_self.objects.title.html(_self.objectData.title);
				_self.objects.title.show();
			} else {
				_self.objects.title.empty();
				_self.objects.title.hide();
			}
			// Add caption to the content holder or hide if its empty
			if (_self.settings.showCaption === true && _self.objectData.caption !== undefined && _self.objectData.caption !== '') {
				_self.objects.caption.html(_self.objectData.caption);
				_self.objects.caption.show();
			} else {
				_self.objects.caption.empty();
				_self.objects.caption.hide();
			}
		},

		/**
		 * Loads the new object
		 *
		 * @param	{object}	$object
		 * @return	{void}
		 */
		_loadObject: function ($object) {
			// Load the object
			switch (_self.objectData.type) {
				case 'inline':
					if ($(_self.objectData.url)) {
						_self._showContent($object);
					} else {
						_self.error();
					}
					break;
				case 'ajax':
					$.ajax(
						$.extend({}, _self.settings.ajax, {
							url: _self.objectData.url,
							type: _self.objectData.requestType,
							dataType: _self.objectData.requestDataType,
							data: _self.objectData.requestData,
							success: function (data, textStatus, jqXHR) {
								// Check for X-Ajax-Location
								if (jqXHR.getResponseHeader('X-Ajax-Location')) {
									_self.objectData.url = jqXHR.getResponseHeader('X-Ajax-Location');
									_self._loadObject($object);
								}
								else {
									// Unserialize if data is transferred as json
									if (_self.objectData.requestDataType === 'json') {
										_self.objectData.data = data;
									} else {
										$object.html(data);
									}
									_self._showContent($object);
								}
							},
							error: function (jqXHR, textStatus, errorThrown) {
								_self.error();
							}
						})
					);
					break;
				case 'flash':
					_self._showContent($object);
					break;
				case 'video':
					if (typeof($object.get(0).canPlayType) === 'function' || _self.objects.case.find('video').length === 0) {
						_self._showContent($object);
					} else {
						_self.error();
					}
					break;
				default:
					if (_self.objectData.url) {
						$object.on('load', function () {
							_self._showContent($object);
						});
						$object.on('error', function () {
							_self.error();
						});
					} else {
						_self.error();
					}
					break;
			}
		},

		/**
		 * Throws an error message if something went wrong
		 *
		 * @return	{void}
		 */
		error: function () {
			_self.objectData.type = 'error';
			var $object = $('<div class="' + _self.settings.classPrefix + 'inlineWrap"></div>');

			$object.html(_self.settings.errorMessage);
			_self.objects.contentInner.html($object);

			_self._showContent(_self.objects.contentInner);
		},

		/**
		 * Calculates the dimensions to fit content
		 *
		 * @param	{object}	$object
		 * @return	{void}
		 */
		_calculateDimensions: function ($object) {
			_self._cleanupDimensions();

			if (!$object) return;

			// Set default dimensions
			var dimensions = {
				ratio: 1,
				objectWidth: $object.attr('width') ? $object.attr('width') : $object.attr(_self._prefixAttributeName('width')),
				objectHeight: $object.attr('height') ? $object.attr('height') : $object.attr(_self._prefixAttributeName('height'))
			};

			if (!_self.settings.disableShrink) {
				// Add calculated maximum width/height to dimensions
				dimensions.maxWidth = parseInt(_self.dimensions.windowWidth * _self.settings.shrinkFactor);
				dimensions.maxHeight = parseInt(_self.dimensions.windowHeight * _self.settings.shrinkFactor);

				// If the auto calculated maxWidth/maxHeight greather than the user-defined one, use that.
				if (dimensions.maxWidth > _self.settings.maxWidth) {
					dimensions.maxWidth = _self.settings.maxWidth;
				}
				if (dimensions.maxHeight > _self.settings.maxHeight) {
					dimensions.maxHeight = _self.settings.maxHeight;
				}

				// Calculate the difference between screen width/height and image width/height
				dimensions.differenceWidthAsPercent = parseInt(100 / dimensions.maxWidth * dimensions.objectWidth);
				dimensions.differenceHeightAsPercent = parseInt(100 / dimensions.maxHeight * dimensions.objectHeight);

				switch (_self.objectData.type) {
					case 'image':
					case 'flash':
					case 'video':
					case 'iframe':
					case 'ajax':
					case 'inline':
						if (_self.objectData.type === 'image' || _self.settings.fixedRatio === true) {
							if (dimensions.differenceWidthAsPercent > 100 && dimensions.differenceWidthAsPercent > dimensions.differenceHeightAsPercent) {
								dimensions.objectWidth = dimensions.maxWidth;
								dimensions.objectHeight = parseInt(dimensions.objectHeight / dimensions.differenceWidthAsPercent * 100);
							}
							if (dimensions.differenceHeightAsPercent > 100 && dimensions.differenceHeightAsPercent > dimensions.differenceWidthAsPercent) {
								dimensions.objectWidth = parseInt(dimensions.objectWidth / dimensions.differenceHeightAsPercent * 100);
								dimensions.objectHeight = dimensions.maxHeight;
							}
							if (dimensions.differenceHeightAsPercent > 100 && dimensions.differenceWidthAsPercent < dimensions.differenceHeightAsPercent) {
								dimensions.objectWidth = parseInt(dimensions.maxWidth / dimensions.differenceHeightAsPercent * dimensions.differenceWidthAsPercent);
								dimensions.objectHeight = dimensions.maxHeight;
							}
							break;
						}
					case 'error':
						if (!isNaN(dimensions.objectWidth) && dimensions.objectWidth > dimensions.maxWidth) {
							dimensions.objectWidth = dimensions.maxWidth;
						}
						break;
					default:
						if ((isNaN(dimensions.objectWidth) || dimensions.objectWidth > dimensions.maxWidth) && !_self.settings.forceWidth) {
							dimensions.objectWidth = dimensions.maxWidth;
						}
						if (((isNaN(dimensions.objectHeight) && dimensions.objectHeight !== 'auto') || dimensions.objectHeight > dimensions.maxHeight) && !_self.settings.forceHeight) {
							dimensions.objectHeight = dimensions.maxHeight;
						}
						break;
				}
			}

			if (_self.settings.forceWidth) {
				try {
					dimensions.objectWidth = _self.settings[_self.objectData.type].width;
				} catch (e) {
					dimensions.objectWidth = _self.settings.width || dimensions.objectWidth;
				}

				dimensions.maxWidth = null;
			}
			if ($object.attr(_self._prefixAttributeName('max-width'))) {
				dimensions.maxWidth = $object.attr(_self._prefixAttributeName('max-width'));
			}

			if (_self.settings.forceHeight) {
				try {
					dimensions.objectHeight = _self.settings[_self.objectData.type].height;
				} catch (e) {
					dimensions.objectHeight = _self.settings.height || dimensions.objectHeight;
				}

				dimensions.maxHeight = null;
			}
			if ($object.attr(_self._prefixAttributeName('max-height'))) {
				dimensions.maxHeight = $object.attr(_self._prefixAttributeName('max-height'));
			}
			_self._adjustDimensions($object, dimensions);
		},

		/**
		 * Adjusts the dimensions
		 *
		 * @param	{object}	$object
		 * @param	{object}	dimensions
		 * @return	{void}
		 */
		_adjustDimensions: function ($object, dimensions) {
			// Adjust width and height
			$object.css({
				'width': dimensions.objectWidth,
				'height': dimensions.objectHeight,
				'max-width': dimensions.maxWidth,
				'max-height': dimensions.maxHeight
			});

			_self.objects.contentInner.css({
				'width': $object.outerWidth(),
				'height': $object.outerHeight(),
				'max-width': '100%'
			});

			_self.objects.case.css({
				'width': _self.objects.contentInner.outerWidth(),
				'max-width': '100%'
			});

			// Adjust margin
			_self.objects.case.css({
				'margin-top': parseInt(-(_self.objects.case.outerHeight() / 2)),
				'margin-left': parseInt(-(_self.objects.case.outerWidth() / 2))
			});
		},

		/**
		 * Handles the _loading
		 *
		 * @param	{string}	process
		 * @return	{void}
		 */
		_loading: function (process) {
			if (process === 'start') {
				_self.objects.case.addClass(_self.settings.classPrefix + 'loading');
				_self.objects.loading.show();
			} else if (process === 'end') {
				_self.objects.case.removeClass(_self.settings.classPrefix + 'loading');
				_self.objects.loading.hide();
			}
		},


		/**
		 * Gets the client screen dimensions
		 *
		 * @return	{object}	dimensions
		 */
		getViewportDimensions: function () {
			return {
				windowWidth: $(window).innerWidth(),
				windowHeight: $(window).innerHeight()
			};
		},

		/**
		 * Verifies the url
		 *
		 * @param	{string}	dataUrl
		 * @return	{object}	dataUrl	Clean url for processing content
		 */
		_verifyDataUrl: function (dataUrl) {
			if (!dataUrl || dataUrl === undefined || dataUrl === '') {
				return false;
			}

			if (dataUrl.indexOf('#') > -1) {
				dataUrl = dataUrl.split('#');
				dataUrl = '#' + dataUrl[dataUrl.length - 1];
			}

			return _self._normalizeUrl(dataUrl.toString());
		},

			//
		/**
		 * Tries to get the (file) suffix of an url
		 *
		 * @param	{string}	url
		 * @return	{string}
		 */
		_getFileUrlSuffix: function (url) {
			var re = /(?:\.([^.]+))?$/;
			return re.exec(url.toLowerCase())[1];
		},

		/**
		 * Verifies the data type of the content to load
		 *
		 * @param	{string}			url
		 * @return	{string|boolean}	Array key if expression matched, else false
		 */
		_verifyDataType: function (url) {
			var typeMapping = _self.settings.typeMapping;

			// Early abort if dataUrl couldn't be verified
			if (!url) {
				return false;
			}

			// Verify the dataType of url according to typeMapping which
			// has been defined in settings.
			for (var key in typeMapping) {
				if (typeMapping.hasOwnProperty(key)) {
					var suffixArr = typeMapping[key].split(',');

					for (var i = 0; i < suffixArr.length; i++) {
						var suffix = suffixArr[i].toLowerCase(),
							regexp = new RegExp('\.(' + suffix + ')$', 'i'),
							str = url.toLowerCase().split('?')[0].substr(-5);

						if (regexp.test(str) === true || (key === 'inline' && (url.indexOf(suffix) > -1))) {
							return key;
						}
					}
				}
			}

			// If no expression matched, return 'iframe'.
			return 'iframe';
		},

		/**
		 * Extends html markup with the essential tags
		 *
		 * @return	{void}
		 */
		_addElements: function () {
			if (typeof _self.objects.case !== 'undefined' && $('#' + _self.objects.case.attr('id')).length) {
				return;
			}

			_self.settings.markup();
		},

		/**
		 * Shows the loaded content
		 *
		 * @param	{object}	$object
		 * @return	{void}
		 */
		_showContent: function ($object) {
			// Add data attribute with the object type
			_self.objects.document.attr(_self._prefixAttributeName('type'), _self.objectData.type);

			_self.cache.object = $object;

			// Call onBeforeShow hook functions
			_self._callHooks(_self.settings.onBeforeShow);

			if (_self.settings.breakBeforeShow) return;
			_self.show();
		},

		/**
		 * Starts the 'inTransition'
		 * @return	{void}
		 */
		_startInTransition: function () {
			switch (_self.transition.in()) {
				case 'scrollTop':
				case 'scrollRight':
				case 'scrollBottom':
				case 'scrollLeft':
				case 'scrollHorizontal':
				case 'scrollVertical':
					_self.transition.scroll(_self.objects.case, 'in', _self.settings.speedIn);
					_self.transition.fade(_self.objects.contentInner, 'in', _self.settings.speedIn);
					break;
				case 'elastic':
					if (_self.objects.case.css('opacity') < 1) {
						_self.transition.zoom(_self.objects.case, 'in', _self.settings.speedIn);
						_self.transition.fade(_self.objects.contentInner, 'in', _self.settings.speedIn);
				}
				case 'fade':
				case 'fadeInline':
					_self.transition.fade(_self.objects.case, 'in', _self.settings.speedIn);
					_self.transition.fade(_self.objects.contentInner, 'in', _self.settings.speedIn);
					break;
				default:
					_self.transition.fade(_self.objects.case, 'in', 0);
					break;
			}

			// End loading.
			_self._loading('end');
			_self.isBusy = false;

			// Set index of the first item opened
			if (!_self.cache.firstOpened) {
				_self.cache.firstOpened = _self.objectData.this;
			}

			// Fade in the info with delay
			_self.objects.info.hide();
			setTimeout(function () {
				 _self.transition.fade(_self.objects.info, 'in', _self.settings.speedIn);
			}, _self.settings.speedIn);

			// Call onFinish hook functions
			_self._callHooks(_self.settings.onFinish);
		},

		/**
		 * Processes the content to show
		 *
		 * @return	{void}
		 */
		_processContent: function () {
			_self.isBusy = true;

			// Fade out the info at first
			_self.transition.fade(_self.objects.info, 'out', 0);

			switch (_self.settings.transitionOut) {
				case 'scrollTop':
				case 'scrollRight':
				case 'scrollBottom':
				case 'scrollLeft':
				case 'scrollVertical':
				case 'scrollHorizontal':
					if (_self.objects.case.is(':hidden')) {
						_self.transition.fade(_self.objects.contentInner, 'out', 0);
						_self.transition.fade(_self.objects.case, 'out', 0, 0, function () {
							_self._loadContent();
						});
					} else {
						_self.transition.scroll(_self.objects.case, 'out', _self.settings.speedOut, function () {
							_self._loadContent();
						});
					}
					break;
				case 'fade':
					if (_self.objects.case.is(':hidden')) {
						_self.transition.fade(_self.objects.case, 'out', 0, 0, function () {
							_self._loadContent();
						});
					} else {
						_self.transition.fade(_self.objects.case, 'out', _self.settings.speedOut, 0, function () {
							_self._loadContent();
						});
					}
					break;
				case 'fadeInline':
				case 'elastic':
					if (_self.objects.case.is(':hidden')) {
						_self.transition.fade(_self.objects.case, 'out', 0, 0, function () {
							_self._loadContent();
						});
					} else {
						_self.transition.fade(_self.objects.contentInner, 'out', _self.settings.speedOut, 0, function () {
							_self._loadContent();
						});
					}
					break;
				default:
					_self.transition.fade(_self.objects.case, 'out', 0, 0, function () {
						_self._loadContent();
					});
					break;
			}
		},

		/**
		 * Handles events for gallery buttons
		 *
		 * @return	{void}
		 */
		_handleEvents: function () {
			_self._unbindEvents();

			_self.objects.nav.children().not(_self.objects.close).hide();

			// If slideshow is enabled, show play/pause and start timeout.
			if (_self.isSlideshowEnabled()) {
				// Only start the timeout if slideshow autostart is enabled and slideshow is not pausing
				if (
					(_self.settings.slideshowAutoStart === true || _self.isSlideshowStarted) &&
					!_self.objects.nav.hasClass(_self.settings.classPrefix + 'paused')
				) {
					_self._startTimeout();
				} else {
					_self._stopTimeout();
				}
			}

			if (_self.settings.liveResize) {
				_self._watchResizeInteraction();
			}

			_self.objects.close.click(function (event) {
				event.preventDefault();
				_self.close();
			});

			if (_self.settings.closeOnOverlayClick === true) {
				_self.objects.overlay.css('cursor', 'pointer').click(function (event) {
					event.preventDefault();

					_self.close();
				});
			}

			if (_self.settings.useKeys === true) {
				_self._addKeyEvents();
			}

			if (_self.objectData.isPartOfSequence) {
				_self.objects.nav.attr(_self._prefixAttributeName('ispartofsequence'), true);
				_self.objects.nav.data('items', _self._setNavigation());

				_self.objects.prev.click(function (event) {
					event.preventDefault();

					if (_self.settings.navigateEndless === true || !_self.item.isFirst()) {
						_self.objects.prev.unbind('click');
						_self.cache.action = 'prev';
						_self.objects.nav.data('items').prev.click();

						if (_self.isSlideshowEnabled()) {
							_self._stopTimeout();
						}
					}
				});

				_self.objects.next.click(function (event) {
					event.preventDefault();

					if (_self.settings.navigateEndless === true || !_self.item.isLast()) {
						_self.objects.next.unbind('click');
						_self.cache.action = 'next';
						_self.objects.nav.data('items').next.click();

						if (_self.isSlideshowEnabled()) {
							_self._stopTimeout();
						}
					}
				});

				if (_self.isSlideshowEnabled()) {
					_self.objects.play.click(function (event) {
						event.preventDefault();
						_self._startTimeout();
					});
					_self.objects.pause.click(function (event) {
						event.preventDefault();
						_self._stopTimeout();
					});
				}

				// Enable swiping if activated
				if (_self.settings.swipe === true) {
					if ($.isPlainObject($.event.special.swipeleft)) {
						_self.objects.case.on('swipeleft', function (event) {
							event.preventDefault();
							_self.objects.next.click();
							if (_self.isSlideshowEnabled()) {
								_self._stopTimeout();
							}
						});
					}
					if ($.isPlainObject($.event.special.swiperight)) {
						_self.objects.case.on('swiperight', function (event) {
							event.preventDefault();
							_self.objects.prev.click();
							if (_self.isSlideshowEnabled()) {
								_self._stopTimeout();
							}
						});
					}
				}
			}
		},

		/**
		 * Adds the key events
		 *
		 * @return	{void}
		 */
		_addKeyEvents: function () {
			$(document).bind('keyup.lightcase', function (event) {
				// Do nothing if lightcase is in process
				if (_self.isBusy) {
					return;
				}

				switch (event.keyCode) {
					// Escape key
					case 27:
						_self.objects.close.click();
						break;
					// Backward key
					case 37:
						if (_self.objectData.isPartOfSequence) {
							_self.objects.prev.click();
						}
						break;
					// Forward key
					case 39:
						if (_self.objectData.isPartOfSequence) {
							_self.objects.next.click();
						}
						break;
				}
			});
		},

		/**
		 * Starts the slideshow timeout
		 *
		 * @return	{void}
		 */
		_startTimeout: function () {
			_self.isSlideshowStarted = true;

			_self.objects.play.hide();
			_self.objects.pause.show();

			_self.cache.action = 'next';
			_self.objects.nav.removeClass(_self.settings.classPrefix + 'paused');

			_self.timeout = setTimeout(function () {
				_self.objects.nav.data('items').next.click();
			}, _self.settings.timeout);
		},

		/**
		 * Stops the slideshow timeout
		 *
		 * @return	{void}
		 */
		_stopTimeout: function () {
			_self.objects.play.show();
			_self.objects.pause.hide();

			_self.objects.nav.addClass(_self.settings.classPrefix + 'paused');

			clearTimeout(_self.timeout);
		},

		/**
		 * Sets the navigator buttons (prev/next)
		 *
		 * @return	{object}	items
		 */
		_setNavigation: function () {
			var $links = $((_self.cache.selector || _self.settings.attr)),
				sequenceLength = _self.objectData.sequenceLength - 1,
				items = {
					prev: $links.eq(_self.objectData.prevIndex),
					next: $links.eq(_self.objectData.nextIndex)
				};

			if (_self.objectData.currentIndex > 0) {
				_self.objects.prev.show();
			} else {
				items.prevItem = $links.eq(sequenceLength);
			}
			if (_self.objectData.nextIndex <= sequenceLength) {
				_self.objects.next.show();
			} else {
				items.next = $links.eq(0);
			}

			if (_self.settings.navigateEndless === true) {
				_self.objects.prev.show();
				_self.objects.next.show();
			}

			return items;
		},

		/**
		 * Item information/status
		 *
		 */
		item: {
			/**
			 * Verifies if the current item is first item.
			 *
			 * @return	{boolean}
			 */
			isFirst: function () {
				return (_self.objectData.currentIndex === 0);
			},

			/**
			 * Verifies if the current item is first item opened.
			 *
			 * @return	{boolean}
			 */
			isFirstOpened: function () {
				return _self.objectData.this.is(_self.cache.firstOpened);
			},

			/**
			 * Verifies if the current item is last item.
			 *
			 * @return	{boolean}
			 */
			isLast: function () {
				return (_self.objectData.currentIndex === (_self.objectData.sequenceLength - 1));
			}
		},

		/**
		 * Clones the object for inline elements
		 *
		 * @param	{object}	$object
		 * @return	{object}	$clone
		 */
		_cloneObject: function ($object) {
			var $clone = $object.clone(),
				objectId = $object.attr('id');

			// If element is hidden, cache the object and remove
			if ($object.is(':hidden')) {
				_self._cacheObjectData($object);
				$object.attr('id', _self.settings.idPrefix + 'temp-' + objectId).empty();
			} else {
				// Prevent duplicated id's
				$clone.removeAttr('id');
			}

			return $clone.show();
		},

		/**
		 * Verifies if it is a mobile device
		 *
		 * @return	{boolean}
		 */
		isMobileDevice: function () {
			var deviceAgent = navigator.userAgent.toLowerCase(),
				agentId = deviceAgent.match(_self.settings.mobileMatchExpression);

			return agentId ? true : false;
		},

		/**
		 * Verifies if css transitions are supported
		 *
		 * @return	{string|boolean}	The transition prefix if supported, else false.
		 */
		isTransitionSupported: function () {
			var body = _self.objects.body.get(0),
				isTransitionSupported = false,
				transitionMapping = {
					'transition': '',
					'WebkitTransition': '-webkit-',
					'MozTransition': '-moz-',
					'OTransition': '-o-',
					'MsTransition': '-ms-'
				};

			for (var key in transitionMapping) {
				if (transitionMapping.hasOwnProperty(key) && key in body.style) {
					_self.support.transition = transitionMapping[key];
					isTransitionSupported = true;
				}
			}

			return isTransitionSupported;
		},

		/**
		 * Transition types
		 *
		 */
		transition: {
			/**
			 * Returns the correct transition type according to the status of interaction.
			 *
			 * @return	{string}	Transition type
			 */
			in: function () {
				if (_self.settings.transitionOpen && !_self.cache.firstOpened) {
					return _self.settings.transitionOpen;
				}
				return _self.settings.transitionIn;
			},

			/**
			 * Fades in/out the object
			 *
			 * @param	{object}	$object
			 * @param	{string}	type
			 * @param	{number}	speed
			 * @param	{number}	opacity
			 * @param	{function}	callback
			 * @return	{void}		Animates an object
			 */
			fade: function ($object, type, speed, opacity, callback) {
				var isInTransition = type === 'in',
					startTransition = {},
					startOpacity = $object.css('opacity'),
					endTransition = {},
					endOpacity = opacity ? opacity: isInTransition ? 1 : 0;

				if (!_self.isOpen && isInTransition) return;

				startTransition['opacity'] = startOpacity;
				endTransition['opacity'] = endOpacity;

				$object.css(_self.support.transition + 'transition', 'none');
				$object.css(startTransition).show();

				// Css transition
				if (_self.support.transitions) {
					endTransition[_self.support.transition + 'transition'] = speed + 'ms ease';

					setTimeout(function () {
						$object.css(endTransition);

						setTimeout(function () {
							$object.css(_self.support.transition + 'transition', '');

							if (callback && (_self.isOpen || !isInTransition)) {
								callback();
							}
						}, speed);
					}, 15);
				} else {
					// Fallback to js transition
					$object.stop();
					$object.animate(endTransition, speed, callback);
				}
			},

			/**
			 * Scrolls in/out the object
			 *
			 * @param	{object}	$object
			 * @param	{string}	type
			 * @param	{number}	speed
			 * @param	{function}	callback
			 * @return	{void}		Animates an object
			 */
			scroll: function ($object, type, speed, callback) {
				var isInTransition = type === 'in',
					transition = isInTransition ? _self.settings.transitionIn : _self.settings.transitionOut,
					direction = 'left',
					startTransition = {},
					startOpacity = isInTransition ? 0 : 1,
					startOffset = isInTransition ? '-50%' : '50%',
					endTransition = {},
					endOpacity = isInTransition ? 1 : 0,
					endOffset = isInTransition ? '50%' : '-50%';

				if (!_self.isOpen && isInTransition) return;

				switch (transition) {
					case 'scrollTop':
						direction = 'top';
						break;
					case 'scrollRight':
						startOffset = isInTransition ? '150%' : '50%';
						endOffset = isInTransition ? '50%' : '150%';
						break;
					case 'scrollBottom':
						direction = 'top';
						startOffset = isInTransition ? '150%' : '50%';
						endOffset = isInTransition ? '50%' : '150%';
						break;
					case 'scrollHorizontal':
						startOffset = isInTransition ? '150%' : '50%';
						endOffset = isInTransition ? '50%' : '-50%';
						break;
					case 'scrollVertical':
						direction = 'top';
						startOffset = isInTransition ? '-50%' : '50%';
						endOffset = isInTransition ? '50%' : '150%';
						break;
				}

				if (_self.cache.action === 'prev') {
					switch (transition) {
						case 'scrollHorizontal':
							startOffset = isInTransition ? '-50%' : '50%';
							endOffset = isInTransition ? '50%' : '150%';
							break;
						case 'scrollVertical':
							startOffset = isInTransition ? '150%' : '50%';
							endOffset = isInTransition ? '50%' : '-50%';
							break;
					}
				}

				startTransition['opacity'] = startOpacity;
				startTransition[direction] = startOffset;

				endTransition['opacity'] = endOpacity;
				endTransition[direction] = endOffset;

				$object.css(_self.support.transition + 'transition', 'none');
				$object.css(startTransition).show();

				// Css transition
				if (_self.support.transitions) {
					endTransition[_self.support.transition + 'transition'] = speed + 'ms ease';

					setTimeout(function () {
						$object.css(endTransition);

						setTimeout(function () {
							$object.css(_self.support.transition + 'transition', '');

							if (callback && (_self.isOpen || !isInTransition)) {
								callback();
							}
						}, speed);
					}, 15);
				} else {
					// Fallback to js transition
					$object.stop();
					$object.animate(endTransition, speed, callback);
				}
			},

			/**
			 * Zooms in/out the object
			 *
			 * @param	{object}	$object
			 * @param	{string}	type
			 * @param	{number}	speed
			 * @param	{function}	callback
			 * @return	{void}		Animates an object
			 */
			zoom: function ($object, type, speed, callback) {
				var isInTransition = type === 'in',
					startTransition = {},
					startOpacity = $object.css('opacity'),
					startScale = isInTransition ? 'scale(0.75)' : 'scale(1)',
					endTransition = {},
					endOpacity = isInTransition ? 1 : 0,
					endScale = isInTransition ? 'scale(1)' : 'scale(0.75)';

				if (!_self.isOpen && isInTransition) return;

				startTransition['opacity'] = startOpacity;
				startTransition[_self.support.transition + 'transform'] = startScale;

				endTransition['opacity'] = endOpacity;

				$object.css(_self.support.transition + 'transition', 'none');
				$object.css(startTransition).show();

				// Css transition
				if (_self.support.transitions) {
					endTransition[_self.support.transition + 'transform'] = endScale;
					endTransition[_self.support.transition + 'transition'] = speed + 'ms ease';

					setTimeout(function () {
						$object.css(endTransition);

						setTimeout(function () {
							$object.css(_self.support.transition + 'transform', '');
							$object.css(_self.support.transition + 'transition', '');

							if (callback && (_self.isOpen || !isInTransition)) {
								callback();
							}
						}, speed);
					}, 15);
				} else {
					// Fallback to js transition
					$object.stop();
					$object.animate(endTransition, speed, callback);
				}
			}
		},

		/**
		 * Calls all the registered functions of a specific hook
		 *
		 * @param	{object}	hooks
		 * @return	{void}
		 */
		_callHooks: function (hooks) {
			if (typeof(hooks) === 'object') {
				$.each(hooks, function(index, hook) {
					if (typeof(hook) === 'function') {
						hook.call(_self.origin);
					}
				});
			}
		},

		/**
		 * Caches the object data
		 *
		 * @param	{object}	$object
		 * @return	{void}
		 */
		_cacheObjectData: function ($object) {
			$.data($object, 'cache', {
				id: $object.attr('id'),
				content: $object.html()
			});

			_self.cache.originalObject = $object;
		},

		/**
		 * Restores the object from cache
		 *
		 * @return	void
		 */
		_restoreObject: function () {
			var $object = $('[id^="' + _self.settings.idPrefix + 'temp-"]');

			$object.attr('id', $.data(_self.cache.originalObject, 'cache').id);
			$object.html($.data(_self.cache.originalObject, 'cache').content);
		},

		/**
		 * Executes functions for a window resize.
		 * It stops an eventual timeout and recalculates dimensions.
		 *
		 * @param	{object}	dimensions
		 * @return	{void}
		 */
		resize: function (event, dimensions) {
			if (!_self.isOpen) return;

			if (_self.isSlideshowEnabled()) {
				_self._stopTimeout();
			}

			if (typeof dimensions === 'object' && dimensions !== null) {
				if (dimensions.width) {
					_self.cache.object.attr(
						_self._prefixAttributeName('width'),
						dimensions.width
					);
				}
				if (dimensions.maxWidth) {
					_self.cache.object.attr(
						_self._prefixAttributeName('max-width'),
						dimensions.maxWidth
					);
				}
				if (dimensions.height) {
					_self.cache.object.attr(
						_self._prefixAttributeName('height'),
						dimensions.height
					);
				}
				if (dimensions.maxHeight) {
					_self.cache.object.attr(
						_self._prefixAttributeName('max-height'),
						dimensions.maxHeight
					);
				}
			}

			_self.dimensions = _self.getViewportDimensions();
			_self._calculateDimensions(_self.cache.object);

			// Call onResize hook functions
			_self._callHooks(_self.settings.onResize);
		},

		/**
		 * Watches for any resize interaction and caches the new sizes.
		 *
		 * @return	{void}
		 */
		_watchResizeInteraction: function () {
			$(window).resize(_self.resize);
		},

		/**
		 * Stop watching any resize interaction related to _self.
		 *
		 * @return	{void}
		 */
		_unwatchResizeInteraction: function () {
			$(window).off('resize', _self.resize);
		},

		/**
		 * Switches to the fullscreen mode
		 *
		 * @return	{void}
		 */
		_switchToFullScreenMode: function () {
			_self.settings.shrinkFactor = 1;
			_self.settings.overlayOpacity = 1;

			$('html').addClass(_self.settings.classPrefix + 'fullScreenMode');
		},

		/**
		 * Enters into the lightcase view
		 *
		 * @return	{void}
		 */
		_open: function () {
			_self.isOpen = true;

			_self.support.transitions = _self.settings.cssTransitions ? _self.isTransitionSupported() : false;
			_self.support.mobileDevice = _self.isMobileDevice();

			if (_self.support.mobileDevice) {
				$('html').addClass(_self.settings.classPrefix + 'isMobileDevice');

				if (_self.settings.fullScreenModeForMobile) {
					_self._switchToFullScreenMode();
				}
			}

			if (!_self.settings.transitionIn) {
				_self.settings.transitionIn = _self.settings.transition;
			}
			if (!_self.settings.transitionOut) {
				_self.settings.transitionOut = _self.settings.transition;
			}

			switch (_self.transition.in()) {
				case 'fade':
				case 'fadeInline':
				case 'elastic':
				case 'scrollTop':
				case 'scrollRight':
				case 'scrollBottom':
				case 'scrollLeft':
				case 'scrollVertical':
				case 'scrollHorizontal':
					if (_self.objects.case.is(':hidden')) {
						_self.objects.close.css('opacity', 0);
						_self.objects.overlay.css('opacity', 0);
						_self.objects.case.css('opacity', 0);
						_self.objects.contentInner.css('opacity', 0);
					}
					_self.transition.fade(_self.objects.overlay, 'in', _self.settings.speedIn, _self.settings.overlayOpacity, function () {
						_self.transition.fade(_self.objects.close, 'in', _self.settings.speedIn);
						_self._handleEvents();
						_self._processContent();
					});
					break;
				default:
					_self.transition.fade(_self.objects.overlay, 'in', 0, _self.settings.overlayOpacity, function () {
						_self.transition.fade(_self.objects.close, 'in', 0);
						_self._handleEvents();
						_self._processContent();
					});
					break;
			}

			_self.objects.document.addClass(_self.settings.classPrefix + 'open');
			_self.objects.case.attr('aria-hidden', 'false');
		},

		/**
		 * Shows the lightcase by starting the transition
		 */
		show: function () {
			// Call onCalculateDimensions hook functions
			_self._callHooks(_self.settings.onBeforeCalculateDimensions);

			_self._calculateDimensions(_self.cache.object);

			// Call onAfterCalculateDimensions hook functions
			_self._callHooks(_self.settings.onAfterCalculateDimensions);

			_self._startInTransition();
		},

		/**
		 * Escapes from the lightcase view
		 *
		 * @return	{void}
		 */
		close: function () {
			_self.isOpen = false;

			if (_self.isSlideshowEnabled()) {
				_self._stopTimeout();
				_self.isSlideshowStarted = false;
				_self.objects.nav.removeClass(_self.settings.classPrefix + 'paused');
			}

			_self.objects.loading.hide();

			_self._unbindEvents();

			_self._unwatchResizeInteraction();

			$('html').removeClass(_self.settings.classPrefix + 'open');
			_self.objects.case.attr('aria-hidden', 'true');

			_self.objects.nav.children().hide();
			_self.objects.close.hide();

			// Call onClose hook functions
			_self._callHooks(_self.settings.onClose);

			// Fade out the info at first
			_self.transition.fade(_self.objects.info, 'out', 0);

			switch (_self.settings.transitionClose || _self.settings.transitionOut) {
				case 'fade':
				case 'fadeInline':
				case 'scrollTop':
				case 'scrollRight':
				case 'scrollBottom':
				case 'scrollLeft':
				case 'scrollHorizontal':
				case 'scrollVertical':
					_self.transition.fade(_self.objects.case, 'out', _self.settings.speedOut, 0, function () {
						_self.transition.fade(_self.objects.overlay, 'out', _self.settings.speedOut, 0, function () {
							_self.cleanup();
						});
					});
					break;
				case 'elastic':
					_self.transition.zoom(_self.objects.case, 'out', _self.settings.speedOut, function () {
						_self.transition.fade(_self.objects.overlay, 'out', _self.settings.speedOut, 0, function () {
							_self.cleanup();
						});
					});
					break;
				default:
					_self.cleanup();
					break;
			}
		},

		/**
		 * Unbinds all given events
		 *
		 * @return	{void}
		 */
		_unbindEvents: function () {
			// Unbind overlay event
			_self.objects.overlay.unbind('click');

			// Unbind key events
			$(document).unbind('keyup.lightcase');

			// Unbind swipe events
			_self.objects.case.unbind('swipeleft').unbind('swiperight');

			// Unbind navigator events
			_self.objects.prev.unbind('click');
			_self.objects.next.unbind('click');
			_self.objects.play.unbind('click');
			_self.objects.pause.unbind('click');

			// Unbind close event
			_self.objects.close.unbind('click');
		},

		/**
		 * Cleans up the dimensions
		 *
		 * @return	{void}
		 */
		_cleanupDimensions: function () {
			var opacity = _self.objects.contentInner.css('opacity');

			_self.objects.case.css({
				'width': '',
				'height': '',
				'top': '',
				'left': '',
				'margin-top': '',
				'margin-left': ''
			});

			_self.objects.contentInner.removeAttr('style').css('opacity', opacity);
			_self.objects.contentInner.children().removeAttr('style');
		},

		/**
		 * Cleanup after aborting lightcase
		 *
		 * @return	{void}
		 */
		cleanup: function () {
			_self._cleanupDimensions();

			_self.objects.loading.hide();
			_self.objects.overlay.hide();
			_self.objects.case.hide();
			_self.objects.prev.hide();
			_self.objects.next.hide();
			_self.objects.play.hide();
			_self.objects.pause.hide();

			_self.objects.document.removeAttr(_self._prefixAttributeName('type'));
			_self.objects.nav.removeAttr(_self._prefixAttributeName('ispartofsequence'));

			_self.objects.contentInner.empty().hide();
			_self.objects.info.children().empty();

			if (_self.cache.originalObject) {
				_self._restoreObject();
			}

			// Call onCleanup hook functions
			_self._callHooks(_self.settings.onCleanup);

			// Restore cache
			_self.cache = {};
		},

		/**
		 * Returns the supported match media or undefined if the browser
		 * doesn't support match media.
		 *
		 * @return	{mixed}
		 */
		_matchMedia: function () {
			return window.matchMedia || window.msMatchMedia;
		},

		/**
		 * Returns the devicePixelRatio if supported. Else, it simply returns
		 * 1 as the default.
		 *
		 * @return	{number}
		 */
		_devicePixelRatio: function () {
			return window.devicePixelRatio || 1;
		},

		/**
		 * Checks if method is public
		 *
		 * @return	{boolean}
		 */
		_isPublicMethod: function (method) {
			return (typeof _self[method] === 'function' && method.charAt(0) !== '_');
		},

		/**
		 * Exports all public methods to be accessible, callable
		 * from global scope.
		 *
		 * @return	{void}
		 */
		_export: function () {
			window.lightcase = {};

			$.each(_self, function (property) {
				if (_self._isPublicMethod(property)) {
					lightcase[property] = _self[property];
				}
			});
		}
	};

	_self._export();

	$.fn.lightcase = function (method) {
		// Method calling logic (only public methods are applied)
		if (_self._isPublicMethod(method)) {
			return _self[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _self.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.lightcase');
		}
	};
})(jQuery);

/* PNotify modules included in this custom build file:
brighttheme
buttons
desktop
*/
/*
PNotify 3.2.0 sciactive.com/pnotify/
(C) 2015 Hunter Perrin; Google, Inc.
license Apache-2.0
*/
/*
 * ====== PNotify ======
 *
 * http://sciactive.com/pnotify/
 *
 * Copyright 2009-2015 Hunter Perrin
 * Copyright 2015 Google, Inc.
 *
 * Licensed under Apache License, Version 2.0.
 * 	http://www.apache.org/licenses/LICENSE-2.0
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify', ['jquery'], function($){
      return factory($, root);
    });
  } else if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory(require('jquery'), global || root);
  } else {
    // Browser globals
    root.PNotify = factory(root.jQuery, root);
  }
}(typeof window !== "undefined" ? window : this, function($, root){
var init = function(root){
  var default_stack = {
    dir1: "down",
    dir2: "left",
    push: "bottom",
    spacing1: 36,
    spacing2: 36,
    context: $("body"),
    modal: false
  };
  var posTimer, // Position all timer.
    body,
    jwindow = $(root);
  // Set global variables.
  var do_when_ready = function(){
    body = $("body");
    PNotify.prototype.options.stack.context = body;
    jwindow = $(root);
    // Reposition the notices when the window resizes.
    jwindow.bind('resize', function(){
      if (posTimer) {
        clearTimeout(posTimer);
      }
      posTimer = setTimeout(function(){
        PNotify.positionAll(true);
      }, 10);
    });
  };
  var createStackOverlay = function(stack) {
    var overlay = $("<div />", {"class": "ui-pnotify-modal-overlay"});
    overlay.prependTo(stack.context);
    if (stack.overlay_close) {
      // Close the notices on overlay click.
      overlay.click(function(){
        PNotify.removeStack(stack);
      });
    }
    return overlay;
  };
  var PNotify = function(options){
    // === Class Variables ===
    this.state = "initializing"; // The state can be "initializing", "opening", "open", "closing", and "closed".
    this.timer = null; // Auto close timer.
    this.animTimer = null; // Animation timer.
    this.styles = null;
    this.elem = null;
    this.container = null;
    this.title_container = null;
    this.text_container = null;
    this.animating = false; // Stores what is currently being animated (in or out).
    this.timerHide = false; // Stores whether the notice was hidden by a timer.

    this.parseOptions(options);
    this.init();
  };
  $.extend(PNotify.prototype, {
    // The current version of PNotify.
    version: "3.2.0",

    // === Options ===

    // Options defaults.
    options: {
      // The notice's title.
      title: false,
      // Whether to escape the content of the title. (Not allow HTML.)
      title_escape: false,
      // The notice's text.
      text: false,
      // Whether to escape the content of the text. (Not allow HTML.)
      text_escape: false,
      // What styling classes to use. (Can be either "brighttheme", "bootstrap3", or "fontawesome".)
      styling: "brighttheme",
      // Additional classes to be added to the notice. (For custom styling.)
      addclass: "",
      // Class to be added to the notice for corner styling.
      cornerclass: "",
      // Display the notice when it is created.
      auto_display: true,
      // Width of the notice.
      width: "300px",
      // Minimum height of the notice. It will expand to fit content.
      min_height: "16px",
      // Type of the notice. "notice", "info", "success", or "error".
      type: "notice",
      // Set icon to true to use the default icon for the selected
      // style/type, false for no icon, or a string for your own icon class.
      icon: true,
      // The animation to use when displaying and hiding the notice. "none"
      // and "fade" are supported through CSS. Others are supported
      // through the Animate module and Animate.css.
      animation: "fade",
      // Speed at which the notice animates in and out. "slow", "normal",
      // or "fast". Respectively, 400ms, 250ms, 100ms.
      animate_speed: "normal",
      // Display a drop shadow.
      shadow: true,
      // After a delay, remove the notice.
      hide: true,
      // Delay in milliseconds before the notice is removed.
      delay: 8000,
      // Reset the hide timer if the mouse moves over the notice.
      mouse_reset: true,
      // Remove the notice's elements from the DOM after it is removed.
      remove: true,
      // Change new lines to br tags.
      insert_brs: true,
      // Whether to remove the notice from the global array when it is closed.
      destroy: true,
      // The stack on which the notices will be placed. Also controls the
      // direction the notices stack.
      stack: default_stack
    },

    // === Modules ===

    // This object holds all the PNotify modules. They are used to provide
    // additional functionality.
    modules: {},
    // This runs an event on all the modules.
    runModules: function(event, arg){
      var curArg;
      for (var module in this.modules) {
        curArg = ((typeof arg === "object" && module in arg) ? arg[module] : arg);
        if (typeof this.modules[module][event] === 'function') {
          this.modules[module].notice = this;
          this.modules[module].options = typeof this.options[module] === 'object' ? this.options[module] : {};
          this.modules[module][event](this, typeof this.options[module] === 'object' ? this.options[module] : {}, curArg);
        }
      }
    },

    // === Events ===

    init: function(){
      var that = this;

      // First and foremost, we don't want our module objects all referencing the prototype.
      this.modules = {};
      $.extend(true, this.modules, PNotify.prototype.modules);

      // Get our styling object.
      if (typeof this.options.styling === "object") {
        this.styles = this.options.styling;
      } else {
        this.styles = PNotify.styling[this.options.styling];
      }

      // Create our widget.
      // Stop animation, reset the removal timer when the user mouses over.
      this.elem = $("<div />", {
        "class": "ui-pnotify "+this.options.addclass,
        "css": {"display": "none"},
        "aria-live": "assertive",
        "aria-role": "alertdialog",
        "mouseenter": function(e){
          if (that.options.mouse_reset && that.animating === "out") {
            if (!that.timerHide) {
              return;
            }
            that.cancelRemove();
          }
          // Stop the close timer.
          if (that.options.hide && that.options.mouse_reset) {
            that.cancelRemove();
          }
        },
        "mouseleave": function(e){
          // Start the close timer.
          if (that.options.hide && that.options.mouse_reset && that.animating !== "out") {
            that.queueRemove();
          }
          PNotify.positionAll();
        }
      });
      // Maybe we need to fade in/out.
      if (this.options.animation === "fade") {
        this.elem.addClass("ui-pnotify-fade-"+this.options.animate_speed);
      }
      // Create a container for the notice contents.
      this.container = $("<div />", {
        "class": this.styles.container+" ui-pnotify-container "+(this.options.type === "error" ? this.styles.error : (this.options.type === "info" ? this.styles.info : (this.options.type === "success" ? this.styles.success : this.styles.notice))),
        "role": "alert"
      }).appendTo(this.elem);
      if (this.options.cornerclass !== "") {
        this.container.removeClass("ui-corner-all").addClass(this.options.cornerclass);
      }
      // Create a drop shadow.
      if (this.options.shadow) {
        this.container.addClass("ui-pnotify-shadow");
      }


      // Add the appropriate icon.
      if (this.options.icon !== false) {
        $("<div />", {"class": "ui-pnotify-icon"})
        .append($("<span />", {"class": this.options.icon === true ? (this.options.type === "error" ? this.styles.error_icon : (this.options.type === "info" ? this.styles.info_icon : (this.options.type === "success" ? this.styles.success_icon : this.styles.notice_icon))) : this.options.icon}))
        .prependTo(this.container);
      }

      // Add a title.
      this.title_container = $("<h4 />", {
        "class": "ui-pnotify-title"
      })
      .appendTo(this.container);
      if (this.options.title === false) {
        this.title_container.hide();
      } else if (this.options.title_escape) {
        this.title_container.text(this.options.title);
      } else {
        this.title_container.html(this.options.title);
      }

      // Add text.
      this.text_container = $("<div />", {
        "class": "ui-pnotify-text",
        "aria-role": "alert"
      })
      .appendTo(this.container);
      if (this.options.text === false) {
        this.text_container.hide();
      } else if (this.options.text_escape) {
        this.text_container.text(this.options.text);
      } else {
        this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, "<br />") : this.options.text);
      }

      // Set width and min height.
      if (typeof this.options.width === "string") {
        this.elem.css("width", this.options.width);
      }
      if (typeof this.options.min_height === "string") {
        this.container.css("min-height", this.options.min_height);
      }


      // Add the notice to the notice array.
      if (this.options.stack.push === "top") {
        PNotify.notices = $.merge([this], PNotify.notices);
      } else {
        PNotify.notices = $.merge(PNotify.notices, [this]);
      }
      // Now position all the notices if they are to push to the top.
      if (this.options.stack.push === "top") {
        this.queuePosition(false, 1);
      }


      // Mark the stack so it won't animate the new notice.
      this.options.stack.animation = false;

      // Run the modules.
      this.runModules('init');

      // We're now initialized, but haven't been opened yet.
      this.state = "closed";

      // Display the notice.
      if (this.options.auto_display) {
        this.open();
      }
      return this;
    },

    // This function is for updating the notice.
    update: function(options){
      // Save old options.
      var oldOpts = this.options;
      // Then update to the new options.
      this.parseOptions(oldOpts, options);
      // Maybe we need to fade in/out.
      this.elem.removeClass("ui-pnotify-fade-slow ui-pnotify-fade-normal ui-pnotify-fade-fast");
      if (this.options.animation === "fade") {
        this.elem.addClass("ui-pnotify-fade-"+this.options.animate_speed);
      }
      // Update the corner class.
      if (this.options.cornerclass !== oldOpts.cornerclass) {
        this.container.removeClass("ui-corner-all "+oldOpts.cornerclass).addClass(this.options.cornerclass);
      }
      // Update the shadow.
      if (this.options.shadow !== oldOpts.shadow) {
        if (this.options.shadow) {
          this.container.addClass("ui-pnotify-shadow");
        } else {
          this.container.removeClass("ui-pnotify-shadow");
        }
      }
      // Update the additional classes.
      if (this.options.addclass === false) {
        this.elem.removeClass(oldOpts.addclass);
      } else if (this.options.addclass !== oldOpts.addclass) {
        this.elem.removeClass(oldOpts.addclass).addClass(this.options.addclass);
      }
      // Update the title.
      if (this.options.title === false) {
        this.title_container.slideUp("fast");
      } else if (this.options.title !== oldOpts.title) {
        if (this.options.title_escape) {
          this.title_container.text(this.options.title);
        } else {
          this.title_container.html(this.options.title);
        }
        if (oldOpts.title === false) {
          this.title_container.slideDown(200);
        }
      }
      // Update the text.
      if (this.options.text === false) {
        this.text_container.slideUp("fast");
      } else if (this.options.text !== oldOpts.text) {
        if (this.options.text_escape) {
          this.text_container.text(this.options.text);
        } else {
          this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, "<br />") : this.options.text);
        }
        if (oldOpts.text === false) {
          this.text_container.slideDown(200);
        }
      }
      // Change the notice type.
      if (this.options.type !== oldOpts.type) {
        this.container.removeClass(
          this.styles.error+" "+this.styles.notice+" "+this.styles.success+" "+this.styles.info
        ).addClass(this.options.type === "error" ?
          this.styles.error :
          (this.options.type === "info" ?
            this.styles.info :
            (this.options.type === "success" ?
              this.styles.success :
              this.styles.notice
            )
          )
        );
      }
      if (this.options.icon !== oldOpts.icon || (this.options.icon === true && this.options.type !== oldOpts.type)) {
        // Remove any old icon.
        this.container.find("div.ui-pnotify-icon").remove();
        if (this.options.icon !== false) {
          // Build the new icon.
          $("<div />", {"class": "ui-pnotify-icon"})
          .append($("<span />", {"class": this.options.icon === true ? (this.options.type === "error" ? this.styles.error_icon : (this.options.type === "info" ? this.styles.info_icon : (this.options.type === "success" ? this.styles.success_icon : this.styles.notice_icon))) : this.options.icon}))
          .prependTo(this.container);
        }
      }
      // Update the width.
      if (this.options.width !== oldOpts.width) {
        this.elem.animate({width: this.options.width});
      }
      // Update the minimum height.
      if (this.options.min_height !== oldOpts.min_height) {
        this.container.animate({minHeight: this.options.min_height});
      }
      // Update the timed hiding.
      if (!this.options.hide) {
        this.cancelRemove();
      } else if (!oldOpts.hide) {
        this.queueRemove();
      }
      this.queuePosition(true);

      // Run the modules.
      this.runModules('update', oldOpts);
      return this;
    },

    // Display the notice.
    open: function(){
      this.state = "opening";
      // Run the modules.
      this.runModules('beforeOpen');

      var that = this;
      // If the notice is not in the DOM, append it.
      if (!this.elem.parent().length) {
        this.elem.appendTo(this.options.stack.context ? this.options.stack.context : body);
      }
      // Try to put it in the right position.
      if (this.options.stack.push !== "top") {
        this.position(true);
      }
      this.animateIn(function(){
        that.queuePosition(true);

        // Now set it to hide.
        if (that.options.hide) {
          that.queueRemove();
        }

        that.state = "open";

        // Run the modules.
        that.runModules('afterOpen');
      });

      return this;
    },

    // Remove the notice.
    remove: function(timer_hide) {
      this.state = "closing";
      this.timerHide = !!timer_hide; // Make sure it's a boolean.
      // Run the modules.
      this.runModules('beforeClose');

      var that = this;
      if (this.timer) {
        root.clearTimeout(this.timer);
        this.timer = null;
      }
      this.animateOut(function(){
        that.state = "closed";
        // Run the modules.
        that.runModules('afterClose');
        that.queuePosition(true);
        // If we're supposed to remove the notice from the DOM, do it.
        if (that.options.remove) {
          that.elem.detach();
        }
        // Run the modules.
        that.runModules('beforeDestroy');
        // Remove object from PNotify.notices to prevent memory leak (issue #49)
        // unless destroy is off
        if (that.options.destroy) {
          if (PNotify.notices !== null) {
            var idx = $.inArray(that, PNotify.notices);
            if (idx !== -1) {
              PNotify.notices.splice(idx,1);
            }
          }
        }
        // Run the modules.
        that.runModules('afterDestroy');
      });

      return this;
    },

    // === Class Methods ===

    // Get the DOM element.
    get: function(){
      return this.elem;
    },

    // Put all the options in the right places.
    parseOptions: function(options, moreOptions){
      this.options = $.extend(true, {}, PNotify.prototype.options);
      // This is the only thing that *should* be copied by reference.
      this.options.stack = PNotify.prototype.options.stack;
      var optArray = [options, moreOptions], curOpts;
      for (var curIndex=0; curIndex < optArray.length; curIndex++) {
        curOpts = optArray[curIndex];
        if (typeof curOpts === "undefined") {
          break;
        }
        if (typeof curOpts !== 'object') {
          this.options.text = curOpts;
        } else {
          for (var option in curOpts) {
            if (this.modules[option]) {
              // Avoid overwriting module defaults.
              $.extend(true, this.options[option], curOpts[option]);
            } else {
              this.options[option] = curOpts[option];
            }
          }
        }
      }
    },

    // Animate the notice in.
    animateIn: function(callback){
      // Declare that the notice is animating in.
      this.animating = "in";
      var that = this;
      var finished = function(){
        if (that.animTimer) {
          clearTimeout(that.animTimer);
        }
        if (that.animating !== "in") {
          return;
        }
        if (that.elem.is(":visible")) {
          if (callback) {
            callback.call();
          }
          // Declare that the notice has completed animating.
          that.animating = false;
        } else {
          that.animTimer = setTimeout(finished, 40);
        }
      };

      if (this.options.animation === "fade") {
        this.elem.one('webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd transitionend', finished).addClass("ui-pnotify-in");
        this.elem.css("opacity"); // This line is necessary for some reason. Some notices don't fade without it.
        this.elem.addClass("ui-pnotify-fade-in");
        // Just in case the event doesn't fire, call it after 650 ms.
        this.animTimer = setTimeout(finished, 650);
      } else {
        this.elem.addClass("ui-pnotify-in");
        finished();
      }
    },

    // Animate the notice out.
    animateOut: function(callback){
      // Declare that the notice is animating out.
      this.animating = "out";
      var that = this;
      var finished = function(){
        if (that.animTimer) {
          clearTimeout(that.animTimer);
        }
        if (that.animating !== "out") {
          return;
        }
        if (that.elem.css("opacity") == "0" || !that.elem.is(":visible")) {
          that.elem.removeClass("ui-pnotify-in");
          if (that.options.stack.overlay) {
            // Go through the modal stack to see if any are left open.
            // TODO: Rewrite this cause it sucks.
            var stillOpen = false;
            $.each(PNotify.notices, function(i, notice){
              if (notice != that && notice.options.stack === that.options.stack && notice.state != "closed") {
                stillOpen = true;
              }
            });
            if (!stillOpen) {
              that.options.stack.overlay.hide();
            }
          }
          if (callback) {
            callback.call();
          }
          // Declare that the notice has completed animating.
          that.animating = false;
        } else {
          // In case this was called before the notice finished animating.
          that.animTimer = setTimeout(finished, 40);
        }
      };

      if (this.options.animation === "fade") {
        this.elem.one('webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd transitionend', finished).removeClass("ui-pnotify-fade-in");
        // Just in case the event doesn't fire, call it after 650 ms.
        this.animTimer = setTimeout(finished, 650);
      } else {
        this.elem.removeClass("ui-pnotify-in");
        finished();
      }
    },

    // Position the notice. dont_skip_hidden causes the notice to
    // position even if it's not visible.
    position: function(dontSkipHidden){
      // Get the notice's stack.
      var stack = this.options.stack,
        elem = this.elem;
      if (typeof stack.context === "undefined") {
        stack.context = body;
      }
      if (!stack) {
        return;
      }
      if (typeof stack.nextpos1 !== "number") {
        stack.nextpos1 = stack.firstpos1;
      }
      if (typeof stack.nextpos2 !== "number") {
        stack.nextpos2 = stack.firstpos2;
      }
      if (typeof stack.addpos2 !== "number") {
        stack.addpos2 = 0;
      }
      var hidden = !elem.hasClass("ui-pnotify-in");
      // Skip this notice if it's not shown.
      if (!hidden || dontSkipHidden) {
        if (stack.modal) {
          if (stack.overlay) {
            stack.overlay.show();
          } else {
            stack.overlay = createStackOverlay(stack);
          }
        }
        // Add animate class by default.
        elem.addClass("ui-pnotify-move");
        var curpos1, curpos2;
        // Calculate the current pos1 value.
        var csspos1;
        switch (stack.dir1) {
          case "down":
            csspos1 = "top";
            break;
          case "up":
            csspos1 = "bottom";
            break;
          case "left":
            csspos1 = "right";
            break;
          case "right":
            csspos1 = "left";
            break;
        }
        curpos1 = parseInt(elem.css(csspos1).replace(/(?:\..*|[^0-9.])/g, ''));
        if (isNaN(curpos1)) {
          curpos1 = 0;
        }
        // Remember the first pos1, so the first visible notice goes there.
        if (typeof stack.firstpos1 === "undefined" && !hidden) {
          stack.firstpos1 = curpos1;
          stack.nextpos1 = stack.firstpos1;
        }
        // Calculate the current pos2 value.
        var csspos2;
        switch (stack.dir2) {
          case "down":
            csspos2 = "top";
            break;
          case "up":
            csspos2 = "bottom";
            break;
          case "left":
            csspos2 = "right";
            break;
          case "right":
            csspos2 = "left";
            break;
        }
        curpos2 = parseInt(elem.css(csspos2).replace(/(?:\..*|[^0-9.])/g, ''));
        if (isNaN(curpos2)) {
          curpos2 = 0;
        }
        // Remember the first pos2, so the first visible notice goes there.
        if (typeof stack.firstpos2 === "undefined" && !hidden) {
          stack.firstpos2 = curpos2;
          stack.nextpos2 = stack.firstpos2;
        }
        // Check that it's not beyond the viewport edge.
        if (
            (stack.dir1 === "down" && stack.nextpos1 + elem.height() > (stack.context.is(body) ? jwindow.height() : stack.context.prop('scrollHeight')) ) ||
            (stack.dir1 === "up" && stack.nextpos1 + elem.height() > (stack.context.is(body) ? jwindow.height() : stack.context.prop('scrollHeight')) ) ||
            (stack.dir1 === "left" && stack.nextpos1 + elem.width() > (stack.context.is(body) ? jwindow.width() : stack.context.prop('scrollWidth')) ) ||
            (stack.dir1 === "right" && stack.nextpos1 + elem.width() > (stack.context.is(body) ? jwindow.width() : stack.context.prop('scrollWidth')) )
          ) {
          // If it is, it needs to go back to the first pos1, and over on pos2.
          stack.nextpos1 = stack.firstpos1;
          stack.nextpos2 += stack.addpos2 + (typeof stack.spacing2 === "undefined" ? 25 : stack.spacing2);
          stack.addpos2 = 0;
        }
        if (typeof stack.nextpos2 === "number") {
          if (!stack.animation) {
            elem.removeClass("ui-pnotify-move");
            elem.css(csspos2, stack.nextpos2+"px");
            elem.css(csspos2);
            elem.addClass("ui-pnotify-move");
          } else {
            elem.css(csspos2, stack.nextpos2+"px");
          }
        }
        // Keep track of the widest/tallest notice in the column/row, so we can push the next column/row.
        switch (stack.dir2) {
          case "down":
          case "up":
            if (elem.outerHeight(true) > stack.addpos2) {
              stack.addpos2 = elem.height();
            }
            break;
          case "left":
          case "right":
            if (elem.outerWidth(true) > stack.addpos2) {
              stack.addpos2 = elem.width();
            }
            break;
        }
        // Move the notice on dir1.
        if (typeof stack.nextpos1 === "number") {
          if (!stack.animation) {
            elem.removeClass("ui-pnotify-move");
            elem.css(csspos1, stack.nextpos1+"px");
            elem.css(csspos1);
            elem.addClass("ui-pnotify-move");
          } else {
            elem.css(csspos1, stack.nextpos1+"px");
          }
        }
        // Calculate the next dir1 position.
        switch (stack.dir1) {
          case "down":
          case "up":
            stack.nextpos1 += elem.height() + (typeof stack.spacing1 === "undefined" ? 25 : stack.spacing1);
            break;
          case "left":
          case "right":
            stack.nextpos1 += elem.width() + (typeof stack.spacing1 === "undefined" ? 25 : stack.spacing1);
            break;
        }
      }
      return this;
    },
    // Queue the position all function so it doesn't run repeatedly and
    // use up resources.
    queuePosition: function(animate, milliseconds){
      if (posTimer) {
        clearTimeout(posTimer);
      }
      if (!milliseconds) {
        milliseconds = 10;
      }
      posTimer = setTimeout(function(){
        PNotify.positionAll(animate);
      }, milliseconds);
      return this;
    },


    // Cancel any pending removal timer.
    cancelRemove: function(){
      if (this.timer) {
        root.clearTimeout(this.timer);
      }
      if (this.animTimer) {
        root.clearTimeout(this.animTimer);
      }
      if (this.state === "closing") {
        // If it's animating out, stop it.
        this.state = "open";
        this.animating = false;
        this.elem.addClass("ui-pnotify-in");
        if (this.options.animation === "fade") {
          this.elem.addClass("ui-pnotify-fade-in");
        }
      }
      return this;
    },
    // Queue a removal timer.
    queueRemove: function(){
      var that = this;
      // Cancel any current removal timer.
      this.cancelRemove();
      this.timer = root.setTimeout(function(){
        that.remove(true);
      }, (isNaN(this.options.delay) ? 0 : this.options.delay));
      return this;
    }
  });
  // These functions affect all notices.
  $.extend(PNotify, {
    // This holds all the notices.
    notices: [],
    reload: init,
    removeAll: function(){
      $.each(PNotify.notices, function(i, notice){
        if (notice.remove) {
          notice.remove(false);
        }
      });
    },
    removeStack: function(stack){
      $.each(PNotify.notices, function(i, notice){
        if (notice.remove && notice.options.stack === stack) {
          notice.remove(false);
        }
      });
    },
    positionAll: function(animate){
      // This timer is used for queueing this function so it doesn't run
      // repeatedly.
      if (posTimer) {
        clearTimeout(posTimer);
      }
      posTimer = null;
      // Reset the next position data.
      if (PNotify.notices && PNotify.notices.length) {
        $.each(PNotify.notices, function(i, notice){
          var s = notice.options.stack;
          if (!s) {
            return;
          }
          if (s.overlay) {
            s.overlay.hide();
          }
          s.nextpos1 = s.firstpos1;
          s.nextpos2 = s.firstpos2;
          s.addpos2 = 0;
          s.animation = animate;
        });
        $.each(PNotify.notices, function(i, notice){
          notice.position();
        });
      } else {
        var s = PNotify.prototype.options.stack;
        if (s) {
          delete s.nextpos1;
          delete s.nextpos2;
        }
      }
    },
    styling: {
      brighttheme: {
        // Bright Theme doesn't require any UI libraries.
        container: "brighttheme",
        notice: "brighttheme-notice",
        notice_icon: "brighttheme-icon-notice",
        info: "brighttheme-info",
        info_icon: "brighttheme-icon-info",
        success: "brighttheme-success",
        success_icon: "brighttheme-icon-success",
        error: "brighttheme-error",
        error_icon: "brighttheme-icon-error"
      },
      bootstrap3: {
        container: "alert",
        notice: "alert-warning",
        notice_icon: "glyphicon glyphicon-exclamation-sign",
        info: "alert-info",
        info_icon: "glyphicon glyphicon-info-sign",
        success: "alert-success",
        success_icon: "glyphicon glyphicon-ok-sign",
        error: "alert-danger",
        error_icon: "glyphicon glyphicon-warning-sign"
      }
    }
  });
  /*
   * uses icons from http://fontawesome.io/
   * version 4.0.3
   */
  PNotify.styling.fontawesome = $.extend({}, PNotify.styling.bootstrap3);
  $.extend(PNotify.styling.fontawesome, {
    notice_icon: "fa fa-exclamation-circle",
    info_icon: "fa fa-info",
    success_icon: "fa fa-check",
    error_icon: "fa fa-warning"
  });

  if (root.document.body) {
    do_when_ready();
  } else {
    $(do_when_ready);
  }
  return PNotify;
};
return init(root);
}));

// Buttons
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify.buttons', ['jquery', 'pnotify'], factory);
  } else if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory(require('jquery'), require('./pnotify'));
  } else {
    // Browser globals
    factory(root.jQuery, root.PNotify);
  }
}(typeof window !== "undefined" ? window : this, function($, PNotify){
  PNotify.prototype.options.buttons = {
    // Provide a button for the user to manually close the notice.
    closer: true,
    // Only show the closer button on hover.
    closer_hover: true,
    // Provide a button for the user to manually stick the notice.
    sticker: true,
    // Only show the sticker button on hover.
    sticker_hover: true,
    // Show the buttons even when the nonblock module is in use.
    show_on_nonblock: false,
    // The various displayed text, helps facilitating internationalization.
    labels: {
      close: "Close",
      stick: "Stick",
      unstick: "Unstick"
    },
    // The classes to use for button icons. Leave them null to use the classes from the styling you're using.
    classes: {
      closer: null,
      pin_up: null,
      pin_down: null
    }
  };
  PNotify.prototype.modules.buttons = {
    init: function(notice, options){
      var that = this;
      notice.elem.on({
        "mouseenter": function(e){
          // Show the buttons.
          if (that.options.sticker && (!(notice.options.nonblock && notice.options.nonblock.nonblock) || that.options.show_on_nonblock)) {
            that.sticker.trigger("pnotify:buttons:toggleStick").css("visibility", "visible");
          }
          if (that.options.closer && (!(notice.options.nonblock && notice.options.nonblock.nonblock) || that.options.show_on_nonblock)) {
            that.closer.css("visibility", "visible");
          }
        },
        "mouseleave": function(e){
          // Hide the buttons.
          if (that.options.sticker_hover) {
            that.sticker.css("visibility", "hidden");
          }
          if (that.options.closer_hover) {
            that.closer.css("visibility", "hidden");
          }
        }
      });

      // Provide a button to stick the notice.
      this.sticker = $("<div />", {
        "class": "ui-pnotify-sticker",
        "aria-role": "button",
        "aria-pressed": notice.options.hide ? "false" : "true",
        "tabindex": "0",
        "title": notice.options.hide ? options.labels.stick : options.labels.unstick,
        "css": {
          "cursor": "pointer",
          "visibility": options.sticker_hover ? "hidden" : "visible"
        },
        "click": function(){
          notice.options.hide = !notice.options.hide;
          if (notice.options.hide) {
            notice.queueRemove();
          } else {
            notice.cancelRemove();
          }
          $(this).trigger("pnotify:buttons:toggleStick");
        }
      })
      .bind("pnotify:buttons:toggleStick", function(){
        var pin_up = that.options.classes.pin_up === null ? notice.styles.pin_up : that.options.classes.pin_up;
        var pin_down = that.options.classes.pin_down === null ? notice.styles.pin_down : that.options.classes.pin_down;
        $(this)
        .attr("title", notice.options.hide ? that.options.labels.stick : that.options.labels.unstick)
        .children()
        .attr("class", "")
        .addClass(notice.options.hide ? pin_up : pin_down)
        .attr("aria-pressed", notice.options.hide ? "false" : "true");
      })
      .append("<span />")
      .trigger("pnotify:buttons:toggleStick")
      .prependTo(notice.container);
      if (!options.sticker || (notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.sticker.css("display", "none");
      }

      // Provide a button to close the notice.
      this.closer = $("<div />", {
        "class": "ui-pnotify-closer",
        "aria-role": "button",
        "tabindex": "0",
        "title": options.labels.close,
        "css": {"cursor": "pointer", "visibility": options.closer_hover ? "hidden" : "visible"},
        "click": function(){
          notice.remove(false);
          that.sticker.css("visibility", "hidden");
          that.closer.css("visibility", "hidden");
        }
      })
      .append($("<span />", {"class": options.classes.closer === null ? notice.styles.closer : options.classes.closer}))
      .prependTo(notice.container);
      if (!options.closer || (notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.closer.css("display", "none");
      }
    },
    update: function(notice, options){
      // Update the sticker and closer buttons.
      if (!options.closer || (notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.closer.css("display", "none");
      } else if (options.closer) {
        this.closer.css("display", "block");
      }
      if (!options.sticker || (notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.sticker.css("display", "none");
      } else if (options.sticker) {
        this.sticker.css("display", "block");
      }
      // Update the sticker icon.
      this.sticker.trigger("pnotify:buttons:toggleStick");
      // Update the close icon.
      this.closer.find("span").attr("class", "").addClass(options.classes.closer === null ? notice.styles.closer : options.classes.closer);
      // Update the hover status of the buttons.
      if (options.sticker_hover) {
        this.sticker.css("visibility", "hidden");
      } else if (!(notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.sticker.css("visibility", "visible");
      }
      if (options.closer_hover) {
        this.closer.css("visibility", "hidden");
      } else if (!(notice.options.nonblock && notice.options.nonblock.nonblock && !options.show_on_nonblock)) {
        this.closer.css("visibility", "visible");
      }
    }
  };
  $.extend(PNotify.styling.brighttheme, {
    closer: "brighttheme-icon-closer",
    pin_up: "brighttheme-icon-sticker",
    pin_down: "brighttheme-icon-sticker brighttheme-icon-stuck"
  });
  $.extend(PNotify.styling.bootstrap3, {
    closer: "glyphicon glyphicon-remove",
    pin_up: "glyphicon glyphicon-pause",
    pin_down: "glyphicon glyphicon-play"
  });
  $.extend(PNotify.styling.fontawesome, {
    closer: "fa fa-times",
    pin_up: "fa fa-pause",
    pin_down: "fa fa-play"
  });
  return PNotify;
}));

// Desktop
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify.desktop', ['jquery', 'pnotify'], factory);
  } else if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory(require('jquery'), require('./pnotify'));
  } else {
    // Browser globals
    factory(root.jQuery, root.PNotify);
  }
}(typeof window !== "undefined" ? window : this, function($, PNotify){
  var permission;
  var notify = function(title, options){
    // Memoize based on feature detection.
    if ("Notification" in window) {
      notify = function (title, options) {
        return new Notification(title, options);
      };
    } else if ("mozNotification" in navigator) {
      notify = function (title, options) {
        // Gecko < 22
        return navigator.mozNotification
          .createNotification(title, options.body, options.icon)
          .show();
      };
    } else if ("webkitNotifications" in window) {
      notify = function (title, options) {
        return window.webkitNotifications.createNotification(
          options.icon,
          title,
          options.body
        );
      };
    } else {
      notify = function (title, options) {
        return null;
      };
    }
    return notify(title, options);
  };


  PNotify.prototype.options.desktop = {
    // Display the notification as a desktop notification.
    desktop: false,
    // If desktop notifications are not supported or allowed, fall back to a regular notice.
    fallback: true,
    // The URL of the icon to display. If false, no icon will show. If null, a default icon will show.
    icon: null,
    // Using a tag lets you update an existing notice, or keep from duplicating notices between tabs.
    // If you leave tag null, one will be generated, facilitating the "update" function.
    // see: http://www.w3.org/TR/notifications/#tags-example
    tag: null,
    // Optionally display a different title for the desktop.
    title: null,
    // Optionally display different text for the desktop.
    text: null
  };
  PNotify.prototype.modules.desktop = {
    genNotice: function(notice, options){
      if (options.icon === null) {
        this.icon = "http://sciactive.com/pnotify/includes/desktop/"+notice.options.type+".png";
      } else if (options.icon === false) {
        this.icon = null;
      } else {
        this.icon = options.icon;
      }
      if (this.tag === null || options.tag !== null) {
        this.tag = options.tag === null ? "PNotify-"+Math.round(Math.random() * 1000000) : options.tag;
      }
      notice.desktop = notify(options.title || notice.options.title, {
        icon: this.icon,
        body: options.text || notice.options.text,
        tag: this.tag
      });
      if (!("close" in notice.desktop) && ("cancel" in notice.desktop)) {
        notice.desktop.close = function(){
          notice.desktop.cancel();
        };
      }
      notice.desktop.onclick = function(){
        notice.elem.trigger("click");
      };
      notice.desktop.onclose = function(){
        if (notice.state !== "closing" && notice.state !== "closed") {
          notice.remove();
        }
      };
    },
    init: function(notice, options){
      if (!options.desktop)
        return;
      permission = PNotify.desktop.checkPermission();
      if (permission !== 0) {
        // Keep the notice from opening if fallback is false.
        if (!options.fallback) {
          notice.options.auto_display = false;
        }
        return;
      }
      this.genNotice(notice, options);
    },
    update: function(notice, options, oldOpts){
      if ((permission !== 0 && options.fallback) || !options.desktop)
        return;
      this.genNotice(notice, options);
    },
    beforeOpen: function(notice, options){
      if ((permission !== 0 && options.fallback) || !options.desktop)
        return;
      notice.elem.css({'left': '-10000px'}).removeClass('ui-pnotify-in');
    },
    afterOpen: function(notice, options){
      if ((permission !== 0 && options.fallback) || !options.desktop)
        return;
      notice.elem.css({'left': '-10000px'}).removeClass('ui-pnotify-in');
      if ("show" in notice.desktop) {
        notice.desktop.show();
      }
    },
    beforeClose: function(notice, options){
      if ((permission !== 0 && options.fallback) || !options.desktop)
        return;
      notice.elem.css({'left': '-10000px'}).removeClass('ui-pnotify-in');
    },
    afterClose: function(notice, options){
      if ((permission !== 0 && options.fallback) || !options.desktop)
        return;
      notice.elem.css({'left': '-10000px'}).removeClass('ui-pnotify-in');
      if ("close" in notice.desktop) {
        notice.desktop.close();
      }
    }
  };
  PNotify.desktop = {
    permission: function(){
      if (typeof Notification !== "undefined" && "requestPermission" in Notification) {
        Notification.requestPermission();
      } else if ("webkitNotifications" in window) {
        window.webkitNotifications.requestPermission();
      }
    },
    checkPermission: function(){
      if (typeof Notification !== "undefined" && "permission" in Notification) {
        return (Notification.permission === "granted" ? 0 : 1);
      } else if ("webkitNotifications" in window) {
        return window.webkitNotifications.checkPermission() == 0 ? 0 : 1;
      } else {
        return 1;
      }
    }
  };
  permission = PNotify.desktop.checkPermission();
  return PNotify;
}));


!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.swal=e():t.swal=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=8)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o="swal-button";e.CLASS_NAMES={MODAL:"swal-modal",OVERLAY:"swal-overlay",SHOW_MODAL:"swal-overlay--show-modal",MODAL_TITLE:"swal-title",MODAL_TEXT:"swal-text",ICON:"swal-icon",ICON_CUSTOM:"swal-icon--custom",CONTENT:"swal-content",FOOTER:"swal-footer",BUTTON_CONTAINER:"swal-button-container",BUTTON:o,CONFIRM_BUTTON:o+"--confirm",CANCEL_BUTTON:o+"--cancel",DANGER_BUTTON:o+"--danger",BUTTON_LOADING:o+"--loading",BUTTON_LOADER:o+"__loader"},e.default=e.CLASS_NAMES},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getNode=function(t){var e="."+t;return document.querySelector(e)},e.stringToNode=function(t){var e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild},e.insertAfter=function(t,e){var n=e.nextSibling;e.parentNode.insertBefore(t,n)},e.removeNode=function(t){t.parentElement.removeChild(t)},e.throwErr=function(t){throw t=t.replace(/ +(?= )/g,""),"SweetAlert: "+(t=t.trim())},e.isPlainObject=function(t){if("[object Object]"!==Object.prototype.toString.call(t))return!1;var e=Object.getPrototypeOf(t);return null===e||e===Object.prototype},e.ordinalSuffixOf=function(t){var e=t%10,n=t%100;return 1===e&&11!==n?t+"st":2===e&&12!==n?t+"nd":3===e&&13!==n?t+"rd":t+"th"}},function(t,e,n){"use strict";function o(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}Object.defineProperty(e,"__esModule",{value:!0}),o(n(25));var r=n(26);e.overlayMarkup=r.default,o(n(27)),o(n(28)),o(n(29));var i=n(0),a=i.default.MODAL_TITLE,s=i.default.MODAL_TEXT,c=i.default.ICON,l=i.default.FOOTER;e.iconMarkup='\n  <div class="'+c+'"></div>',e.titleMarkup='\n  <div class="'+a+'"></div>\n',e.textMarkup='\n  <div class="'+s+'"></div>',e.footerMarkup='\n  <div class="'+l+'"></div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1);e.CONFIRM_KEY="confirm",e.CANCEL_KEY="cancel";var r={visible:!0,text:null,value:null,className:"",closeModal:!0},i=Object.assign({},r,{visible:!1,text:"Cancel",value:null}),a=Object.assign({},r,{text:"OK",value:!0});e.defaultButtonList={cancel:i,confirm:a};var s=function(t){switch(t){case e.CONFIRM_KEY:return a;case e.CANCEL_KEY:return i;default:var n=t.charAt(0).toUpperCase()+t.slice(1);return Object.assign({},r,{text:n,value:t})}},c=function(t,e){var n=s(t);return!0===e?Object.assign({},n,{visible:!0}):"string"==typeof e?Object.assign({},n,{visible:!0,text:e}):o.isPlainObject(e)?Object.assign({visible:!0},n,e):Object.assign({},n,{visible:!1})},l=function(t){for(var e={},n=0,o=Object.keys(t);n<o.length;n++){var r=o[n],a=t[r],s=c(r,a);e[r]=s}return e.cancel||(e.cancel=i),e},u=function(t){var n={};switch(t.length){case 1:n[e.CANCEL_KEY]=Object.assign({},i,{visible:!1});break;case 2:n[e.CANCEL_KEY]=c(e.CANCEL_KEY,t[0]),n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t[1]);break;default:o.throwErr("Invalid number of 'buttons' in array ("+t.length+").\n      If you want more than 2 buttons, you need to use an object!")}return n};e.getButtonListOpts=function(t){var n=e.defaultButtonList;return"string"==typeof t?n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t):Array.isArray(t)?n=u(t):o.isPlainObject(t)?n=l(t):!0===t?n=u([!0,!0]):!1===t?n=u([!1,!1]):void 0===t&&(n=e.defaultButtonList),n}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=n(0),a=i.default.MODAL,s=i.default.OVERLAY,c=n(30),l=n(31),u=n(32),f=n(33);e.injectElIntoModal=function(t){var e=o.getNode(a),n=o.stringToNode(t);return e.appendChild(n),n};var d=function(t){t.className=a,t.textContent=""},p=function(t,e){d(t);var n=e.className;n&&t.classList.add(n)};e.initModalContent=function(t){var e=o.getNode(a);p(e,t),c.default(t.icon),l.initTitle(t.title),l.initText(t.text),f.default(t.content),u.default(t.buttons,t.dangerMode)};var m=function(){var t=o.getNode(s),e=o.stringToNode(r.modalMarkup);t.appendChild(e)};e.default=m},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r={isOpen:!1,promise:null,actions:{},timer:null},i=Object.assign({},r);e.resetState=function(){i=Object.assign({},r)},e.setActionValue=function(t){if("string"==typeof t)return a(o.CONFIRM_KEY,t);for(var e in t)a(e,t[e])};var a=function(t,e){i.actions[t]||(i.actions[t]={}),Object.assign(i.actions[t],{value:e})};e.setActionOptionsFor=function(t,e){var n=(void 0===e?{}:e).closeModal,o=void 0===n||n;Object.assign(i.actions[t],{closeModal:o})},e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(0),a=i.default.OVERLAY,s=i.default.SHOW_MODAL,c=i.default.BUTTON,l=i.default.BUTTON_LOADING,u=n(5);e.openModal=function(){o.getNode(a).classList.add(s),u.default.isOpen=!0};var f=function(){o.getNode(a).classList.remove(s),u.default.isOpen=!1};e.onAction=function(t){void 0===t&&(t=r.CANCEL_KEY);var e=u.default.actions[t],n=e.value;if(!1===e.closeModal){var i=c+"--"+t;o.getNode(i).classList.add(l)}else f();u.default.promise.resolve(n)},e.getState=function(){var t=Object.assign({},u.default);return delete t.promise,delete t.timer,t},e.stopLoading=function(){for(var t=document.querySelectorAll("."+c),e=0;e<t.length;e++){t[e].classList.remove(l)}}},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){(function(e){t.exports=e.sweetAlert=n(9)}).call(e,n(7))},function(t,e,n){(function(e){t.exports=e.swal=n(10)}).call(e,n(7))},function(t,e,n){"undefined"!=typeof window&&n(11),n(16);var o=n(23).default;t.exports=o},function(t,e,n){var o=n(12);"string"==typeof o&&(o=[[t.i,o,""]]);var r={insertAt:"top"};r.transform=void 0;n(14)(o,r);o.locals&&(t.exports=o.locals)},function(t,e,n){e=t.exports=n(13)(void 0),e.push([t.i,'.swal-icon--error{border-color:#f27474;-webkit-animation:animateErrorIcon .5s;animation:animateErrorIcon .5s}.swal-icon--error__x-mark{position:relative;display:block;-webkit-animation:animateXMark .5s;animation:animateXMark .5s}.swal-icon--error__line{position:absolute;height:5px;width:47px;background-color:#f27474;display:block;top:37px;border-radius:2px}.swal-icon--error__line--left{-webkit-transform:rotate(45deg);transform:rotate(45deg);left:17px}.swal-icon--error__line--right{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);right:16px}@-webkit-keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@-webkit-keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}@keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}.swal-icon--warning{border-color:#f8bb86;-webkit-animation:pulseWarning .75s infinite alternate;animation:pulseWarning .75s infinite alternate}.swal-icon--warning__body{width:5px;height:47px;top:10px;border-radius:2px;margin-left:-2px}.swal-icon--warning__body,.swal-icon--warning__dot{position:absolute;left:50%;background-color:#f8bb86}.swal-icon--warning__dot{width:7px;height:7px;border-radius:50%;margin-left:-4px;bottom:-11px}@-webkit-keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}@keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}.swal-icon--success{border-color:#a5dc86}.swal-icon--success:after,.swal-icon--success:before{content:"";border-radius:50%;position:absolute;width:60px;height:120px;background:#fff;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.swal-icon--success:before{border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;transform-origin:60px 60px}.swal-icon--success:after{border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;transform-origin:0 60px;-webkit-animation:rotatePlaceholder 4.25s ease-in;animation:rotatePlaceholder 4.25s ease-in}.swal-icon--success__ring{width:80px;height:80px;border:4px solid hsla(98,55%,69%,.2);border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.swal-icon--success__hide-corners{width:5px;height:90px;background-color:#fff;padding:1px;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.swal-icon--success__line{height:5px;background-color:#a5dc86;display:block;border-radius:2px;position:absolute;z-index:2}.swal-icon--success__line--tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);transform:rotate(45deg);-webkit-animation:animateSuccessTip .75s;animation:animateSuccessTip .75s}.swal-icon--success__line--long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-animation:animateSuccessLong .75s;animation:animateSuccessLong .75s}@-webkit-keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@-webkit-keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@-webkit-keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}@keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}.swal-icon--info{border-color:#c9dae1}.swal-icon--info:before{width:5px;height:29px;bottom:17px;border-radius:2px;margin-left:-2px}.swal-icon--info:after,.swal-icon--info:before{content:"";position:absolute;left:50%;background-color:#c9dae1}.swal-icon--info:after{width:7px;height:7px;border-radius:50%;margin-left:-3px;top:19px}.swal-icon{width:80px;height:80px;border-width:4px;border-style:solid;border-radius:50%;padding:0;position:relative;box-sizing:content-box;margin:20px auto}.swal-icon:first-child{margin-top:32px}.swal-icon--custom{width:auto;height:auto;max-width:100%;border:none;border-radius:0}.swal-icon img{max-width:100%;max-height:100%}.swal-title{color:rgba(0,0,0,.65);font-weight:600;text-transform:none;position:relative;display:block;padding:13px 16px;font-size:27px;line-height:normal;text-align:center;margin-bottom:0}.swal-title:first-child{margin-top:26px}.swal-title:not(:first-child){padding-bottom:0}.swal-title:not(:last-child){margin-bottom:13px}.swal-text{font-size:16px;position:relative;float:none;line-height:normal;vertical-align:top;text-align:left;display:inline-block;margin:0;padding:0 10px;font-weight:400;color:rgba(0,0,0,.64);max-width:calc(100% - 20px);overflow-wrap:break-word;box-sizing:border-box}.swal-text:first-child{margin-top:45px}.swal-text:last-child{margin-bottom:45px}.swal-footer{text-align:right;padding-top:13px;margin-top:13px;padding:13px 16px;border-radius:inherit;border-top-left-radius:0;border-top-right-radius:0}.swal-button-container{margin:5px;display:inline-block;position:relative}.swal-button{background-color:#7cd1f9;color:#fff;border:none;box-shadow:none;border-radius:5px;font-weight:600;font-size:14px;padding:10px 24px;margin:0;cursor:pointer}.swal-button[not:disabled]:hover{background-color:#78cbf2}.swal-button:active{background-color:#70bce0}.swal-button:focus{outline:none;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(43,114,165,.29)}.swal-button[disabled]{opacity:.5;cursor:default}.swal-button::-moz-focus-inner{border:0}.swal-button--cancel{color:#555;background-color:#efefef}.swal-button--cancel[not:disabled]:hover{background-color:#e8e8e8}.swal-button--cancel:active{background-color:#d7d7d7}.swal-button--cancel:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(116,136,150,.29)}.swal-button--danger{background-color:#e64942}.swal-button--danger[not:disabled]:hover{background-color:#df4740}.swal-button--danger:active{background-color:#cf423b}.swal-button--danger:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(165,43,43,.29)}.swal-content{padding:0 20px;margin-top:20px;font-size:medium}.swal-content:last-child{margin-bottom:20px}.swal-content__input,.swal-content__textarea{-webkit-appearance:none;background-color:#fff;border:none;font-size:14px;display:block;box-sizing:border-box;width:100%;border:1px solid rgba(0,0,0,.14);padding:10px 13px;border-radius:2px;transition:border-color .2s}.swal-content__input:focus,.swal-content__textarea:focus{outline:none;border-color:#6db8ff}.swal-content__textarea{resize:vertical}.swal-button--loading{color:transparent}.swal-button--loading~.swal-button__loader{opacity:1}.swal-button__loader{position:absolute;height:auto;width:43px;z-index:2;left:50%;top:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);text-align:center;pointer-events:none;opacity:0}.swal-button__loader div{display:inline-block;float:none;vertical-align:baseline;width:9px;height:9px;padding:0;border:none;margin:2px;opacity:.4;border-radius:7px;background-color:hsla(0,0%,100%,.9);transition:background .2s;-webkit-animation:swal-loading-anim 1s infinite;animation:swal-loading-anim 1s infinite}.swal-button__loader div:nth-child(3n+2){-webkit-animation-delay:.15s;animation-delay:.15s}.swal-button__loader div:nth-child(3n+3){-webkit-animation-delay:.3s;animation-delay:.3s}@-webkit-keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}@keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}.swal-overlay{position:fixed;top:0;bottom:0;left:0;right:0;text-align:center;font-size:0;overflow-y:auto;background-color:rgba(0,0,0,.4);z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s}.swal-overlay:before{content:" ";display:inline-block;vertical-align:middle;height:100%}.swal-overlay--show-modal{opacity:1;pointer-events:auto}.swal-overlay--show-modal .swal-modal{opacity:1;pointer-events:auto;box-sizing:border-box;-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s;will-change:transform}.swal-modal{width:478px;opacity:0;pointer-events:none;background-color:#fff;text-align:center;border-radius:5px;position:static;margin:20px auto;display:inline-block;vertical-align:middle;-webkit-transform:scale(1);transform:scale(1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;z-index:10001;transition:opacity .2s,-webkit-transform .3s;transition:transform .3s,opacity .2s;transition:transform .3s,opacity .2s,-webkit-transform .3s}@media (max-width:500px){.swal-modal{width:calc(100% - 20px)}}@-webkit-keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}',""])},function(t,e){function n(t,e){var n=t[1]||"",r=t[3];if(!r)return n;if(e&&"function"==typeof btoa){var i=o(r);return[n].concat(r.sources.map(function(t){return"/*# sourceURL="+r.sourceRoot+t+" */"})).concat([i]).join("\n")}return[n].join("\n")}function o(t){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(t))))+" */"}t.exports=function(t){var e=[];return e.toString=function(){return this.map(function(e){var o=n(e,t);return e[2]?"@media "+e[2]+"{"+o+"}":o}).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var o={},r=0;r<this.length;r++){var i=this[r][0];"number"==typeof i&&(o[i]=!0)}for(r=0;r<t.length;r++){var a=t[r];"number"==typeof a[0]&&o[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(t,e,n){function o(t,e){for(var n=0;n<t.length;n++){var o=t[n],r=m[o.id];if(r){r.refs++;for(var i=0;i<r.parts.length;i++)r.parts[i](o.parts[i]);for(;i<o.parts.length;i++)r.parts.push(u(o.parts[i],e))}else{for(var a=[],i=0;i<o.parts.length;i++)a.push(u(o.parts[i],e));m[o.id]={id:o.id,refs:1,parts:a}}}}function r(t,e){for(var n=[],o={},r=0;r<t.length;r++){var i=t[r],a=e.base?i[0]+e.base:i[0],s=i[1],c=i[2],l=i[3],u={css:s,media:c,sourceMap:l};o[a]?o[a].parts.push(u):n.push(o[a]={id:a,parts:[u]})}return n}function i(t,e){var n=v(t.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var o=w[w.length-1];if("top"===t.insertAt)o?o.nextSibling?n.insertBefore(e,o.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),w.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(e)}}function a(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=w.indexOf(t);e>=0&&w.splice(e,1)}function s(t){var e=document.createElement("style");return t.attrs.type="text/css",l(e,t.attrs),i(t,e),e}function c(t){var e=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",l(e,t.attrs),i(t,e),e}function l(t,e){Object.keys(e).forEach(function(n){t.setAttribute(n,e[n])})}function u(t,e){var n,o,r,i;if(e.transform&&t.css){if(!(i=e.transform(t.css)))return function(){};t.css=i}if(e.singleton){var l=h++;n=g||(g=s(e)),o=f.bind(null,n,l,!1),r=f.bind(null,n,l,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=c(e),o=p.bind(null,n,e),r=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(e),o=d.bind(null,n),r=function(){a(n)});return o(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;o(t=e)}else r()}}function f(t,e,n,o){var r=n?"":o.css;if(t.styleSheet)t.styleSheet.cssText=x(e,r);else{var i=document.createTextNode(r),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(i,a[e]):t.appendChild(i)}}function d(t,e){var n=e.css,o=e.media;if(o&&t.setAttribute("media",o),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}function p(t,e,n){var o=n.css,r=n.sourceMap,i=void 0===e.convertToAbsoluteUrls&&r;(e.convertToAbsoluteUrls||i)&&(o=y(o)),r&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var a=new Blob([o],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}var m={},b=function(t){var e;return function(){return void 0===e&&(e=t.apply(this,arguments)),e}}(function(){return window&&document&&document.all&&!window.atob}),v=function(t){var e={};return function(n){return void 0===e[n]&&(e[n]=t.call(this,n)),e[n]}}(function(t){return document.querySelector(t)}),g=null,h=0,w=[],y=n(15);t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");e=e||{},e.attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||(e.singleton=b()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=r(t,e);return o(n,e),function(t){for(var i=[],a=0;a<n.length;a++){var s=n[a],c=m[s.id];c.refs--,i.push(c)}if(t){o(r(t,e),e)}for(var a=0;a<i.length;a++){var c=i[a];if(0===c.refs){for(var l=0;l<c.parts.length;l++)c.parts[l]();delete m[c.id]}}}};var x=function(){var t=[];return function(e,n){return t[e]=n,t.filter(Boolean).join("\n")}}()},function(t,e){t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var n=e.protocol+"//"+e.host,o=n+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,e){var r=e.trim().replace(/^"(.*)"$/,function(t,e){return e}).replace(/^'(.*)'$/,function(t,e){return e});if(/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(r))return t;var i;return i=0===r.indexOf("//")?r:0===r.indexOf("/")?n+r:o+r.replace(/^\.\//,""),"url("+JSON.stringify(i)+")"})}},function(t,e,n){var o=n(17);"undefined"==typeof window||window.Promise||(window.Promise=o),n(21),String.prototype.includes||(String.prototype.includes=function(t,e){"use strict";return"number"!=typeof e&&(e=0),!(e+t.length>this.length)&&-1!==this.indexOf(t,e)}),Array.prototype.includes||Object.defineProperty(Array.prototype,"includes",{value:function(t,e){if(null==this)throw new TypeError('"this" is null or not defined');var n=Object(this),o=n.length>>>0;if(0===o)return!1;for(var r=0|e,i=Math.max(r>=0?r:o-Math.abs(r),0);i<o;){if(function(t,e){return t===e||"number"==typeof t&&"number"==typeof e&&isNaN(t)&&isNaN(e)}(n[i],t))return!0;i++}return!1}}),"undefined"!=typeof window&&function(t){t.forEach(function(t){t.hasOwnProperty("remove")||Object.defineProperty(t,"remove",{configurable:!0,enumerable:!0,writable:!0,value:function(){this.parentNode.removeChild(this)}})})}([Element.prototype,CharacterData.prototype,DocumentType.prototype])},function(t,e,n){(function(e){!function(n){function o(){}function r(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;if(0===t._state)return void t._deferreds.push(e);t._handled=!0,i._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?s:c)(e.promise,t._value);var o;try{o=n(t._value)}catch(t){return void c(e.promise,t)}s(e.promise,o)})}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void l(t);if("function"==typeof n)return void f(r(n,e),t)}t._state=1,t._value=e,l(t)}catch(e){c(t,e)}}function c(t,e){t._state=2,t._value=e,l(t)}function l(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t))},function(t){n||(n=!0,c(e,t))})}catch(t){if(n)return;n=!0,c(e,t)}}var d=setTimeout;i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var n=new this.constructor(o);return a(this,new u(t,e,n)),n},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function o(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(t){o(i,t)},n)}e[i]=a,0==--r&&t(e)}catch(t){n(t)}}if(0===e.length)return t([]);for(var r=e.length,i=0;i<e.length;i++)o(i,e[i])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var o=0,r=t.length;o<r;o++)t[o].then(e,n)})},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(t){d(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},i._setImmediateFn=function(t){i._immediateFn=t},i._setUnhandledRejectionFn=function(t){i._unhandledRejectionFn=t},void 0!==t&&t.exports?t.exports=i:n.Promise||(n.Promise=i)}(this)}).call(e,n(18).setImmediate)},function(t,e,n){function o(t,e){this._id=t,this._clearFn=e}var r=Function.prototype.apply;e.setTimeout=function(){return new o(r.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new o(r.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(19),e.setImmediate=setImmediate,e.clearImmediate=clearImmediate},function(t,e,n){(function(t,e){!function(t,n){"use strict";function o(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var o={callback:t,args:e};return l[c]=o,s(c),c++}function r(t){delete l[t]}function i(t){var e=t.callback,o=t.args;switch(o.length){case 0:e();break;case 1:e(o[0]);break;case 2:e(o[0],o[1]);break;case 3:e(o[0],o[1],o[2]);break;default:e.apply(n,o)}}function a(t){if(u)setTimeout(a,0,t);else{var e=l[t];if(e){u=!0;try{i(e)}finally{r(t),u=!1}}}}if(!t.setImmediate){var s,c=1,l={},u=!1,f=t.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(t);d=d&&d.setTimeout?d:t,"[object process]"==={}.toString.call(t.process)?function(){s=function(t){e.nextTick(function(){a(t)})}}():function(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}()?function(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&a(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),s=function(n){t.postMessage(e+n,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){a(t.data)},s=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;s=function(e){var n=f.createElement("script");n.onreadystatechange=function(){a(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}():function(){s=function(t){setTimeout(a,0,t)}}(),d.setImmediate=o,d.clearImmediate=r}}("undefined"==typeof self?void 0===t?this:t:self)}).call(e,n(7),n(20))},function(t,e){function n(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function r(t){if(u===setTimeout)return setTimeout(t,0);if((u===n||!u)&&setTimeout)return u=setTimeout,setTimeout(t,0);try{return u(t,0)}catch(e){try{return u.call(null,t,0)}catch(e){return u.call(this,t,0)}}}function i(t){if(f===clearTimeout)return clearTimeout(t);if((f===o||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{return f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}function a(){b&&p&&(b=!1,p.length?m=p.concat(m):v=-1,m.length&&s())}function s(){if(!b){var t=r(a);b=!0;for(var e=m.length;e;){for(p=m,m=[];++v<e;)p&&p[v].run();v=-1,e=m.length}p=null,b=!1,i(t)}}function c(t,e){this.fun=t,this.array=e}function l(){}var u,f,d=t.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:n}catch(t){u=n}try{f="function"==typeof clearTimeout?clearTimeout:o}catch(t){f=o}}();var p,m=[],b=!1,v=-1;d.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];m.push(new c(t,e)),1!==m.length||b||r(s)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=l,d.addListener=l,d.once=l,d.off=l,d.removeListener=l,d.removeAllListeners=l,d.emit=l,d.prependListener=l,d.prependOnceListener=l,d.listeners=function(t){return[]},d.binding=function(t){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(t){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(t,e,n){"use strict";n(22).polyfill()},function(t,e,n){"use strict";function o(t,e){if(void 0===t||null===t)throw new TypeError("Cannot convert first argument to object");for(var n=Object(t),o=1;o<arguments.length;o++){var r=arguments[o];if(void 0!==r&&null!==r)for(var i=Object.keys(Object(r)),a=0,s=i.length;a<s;a++){var c=i[a],l=Object.getOwnPropertyDescriptor(r,c);void 0!==l&&l.enumerable&&(n[c]=r[c])}}return n}function r(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:o})}t.exports={assign:o,polyfill:r}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(24),r=n(6),i=n(5),a=n(36),s=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if("undefined"!=typeof window){var n=a.getOpts.apply(void 0,t);return new Promise(function(t,e){i.default.promise={resolve:t,reject:e},o.default(n),setTimeout(function(){r.openModal()})})}};s.close=r.onAction,s.getState=r.getState,s.setActionValue=i.setActionValue,s.stopLoading=r.stopLoading,s.setDefaults=a.setDefaults,e.default=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(0),i=r.default.MODAL,a=n(4),s=n(34),c=n(35),l=n(1);e.init=function(t){o.getNode(i)||(document.body||l.throwErr("You can only use SweetAlert AFTER the DOM has loaded!"),s.default(),a.default()),a.initModalContent(t),c.default(t)},e.default=e.init},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.MODAL;e.modalMarkup='\n  <div class="'+r+'" role="dialog" aria-modal="true"></div>',e.default=e.modalMarkup},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.OVERLAY,i='<div \n    class="'+r+'"\n    tabIndex="-1">\n  </div>';e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.ICON;e.errorIconMarkup=function(){var t=r+"--error",e=t+"__line";return'\n    <div class="'+t+'__x-mark">\n      <span class="'+e+" "+e+'--left"></span>\n      <span class="'+e+" "+e+'--right"></span>\n    </div>\n  '},e.warningIconMarkup=function(){var t=r+"--warning";return'\n    <span class="'+t+'__body">\n      <span class="'+t+'__dot"></span>\n    </span>\n  '},e.successIconMarkup=function(){var t=r+"--success";return'\n    <span class="'+t+"__line "+t+'__line--long"></span>\n    <span class="'+t+"__line "+t+'__line--tip"></span>\n\n    <div class="'+t+'__ring"></div>\n    <div class="'+t+'__hide-corners"></div>\n  '}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.CONTENT;e.contentMarkup='\n  <div class="'+r+'">\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.BUTTON_CONTAINER,i=o.default.BUTTON,a=o.default.BUTTON_LOADER;e.buttonMarkup='\n  <div class="'+r+'">\n\n    <button\n      class="'+i+'"\n    ></button>\n\n    <div class="'+a+'">\n      <div></div>\n      <div></div>\n      <div></div>\n    </div>\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(4),r=n(2),i=n(0),a=i.default.ICON,s=i.default.ICON_CUSTOM,c=["error","warning","success","info"],l={error:r.errorIconMarkup(),warning:r.warningIconMarkup(),success:r.successIconMarkup()},u=function(t,e){var n=a+"--"+t;e.classList.add(n);var o=l[t];o&&(e.innerHTML=o)},f=function(t,e){e.classList.add(s);var n=document.createElement("img");n.src=t,e.appendChild(n)},d=function(t){if(t){var e=o.injectElIntoModal(r.iconMarkup);c.includes(t)?u(t,e):f(t,e)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(2),r=n(4),i=function(t){navigator.userAgent.includes("AppleWebKit")&&(t.style.display="none",t.offsetHeight,t.style.display="")};e.initTitle=function(t){if(t){var e=r.injectElIntoModal(o.titleMarkup);e.textContent=t,i(e)}},e.initText=function(t){if(t){var e=document.createDocumentFragment();t.split("\n").forEach(function(t,n,o){e.appendChild(document.createTextNode(t)),n<o.length-1&&e.appendChild(document.createElement("br"))});var n=r.injectElIntoModal(o.textMarkup);n.appendChild(e),i(n)}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(4),i=n(0),a=i.default.BUTTON,s=i.default.DANGER_BUTTON,c=n(3),l=n(2),u=n(6),f=n(5),d=function(t,e,n){var r=e.text,i=e.value,d=e.className,p=e.closeModal,m=o.stringToNode(l.buttonMarkup),b=m.querySelector("."+a),v=a+"--"+t;if(b.classList.add(v),d){(Array.isArray(d)?d:d.split(" ")).filter(function(t){return t.length>0}).forEach(function(t){b.classList.add(t)})}n&&t===c.CONFIRM_KEY&&b.classList.add(s),b.textContent=r;var g={};return g[t]=i,f.setActionValue(g),f.setActionOptionsFor(t,{closeModal:p}),b.addEventListener("click",function(){return u.onAction(t)}),m},p=function(t,e){var n=r.injectElIntoModal(l.footerMarkup);for(var o in t){var i=t[o],a=d(o,i,e);i.visible&&n.appendChild(a)}0===n.children.length&&n.remove()};e.default=p},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r=n(4),i=n(2),a=n(5),s=n(6),c=n(0),l=c.default.CONTENT,u=function(t){t.addEventListener("input",function(t){var e=t.target,n=e.value;a.setActionValue(n)}),t.addEventListener("keyup",function(t){if("Enter"===t.key)return s.onAction(o.CONFIRM_KEY)}),setTimeout(function(){t.focus(),a.setActionValue("")},0)},f=function(t,e,n){var o=document.createElement(e),r=l+"__"+e;o.classList.add(r);for(var i in n){var a=n[i];o[i]=a}"input"===e&&u(o),t.appendChild(o)},d=function(t){if(t){var e=r.injectElIntoModal(i.contentMarkup),n=t.element,o=t.attributes;"string"==typeof n?f(e,n,o):e.appendChild(n)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=function(){var t=o.stringToNode(r.overlayMarkup);document.body.appendChild(t)};e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),r=n(6),i=n(1),a=n(3),s=n(0),c=s.default.MODAL,l=s.default.BUTTON,u=s.default.OVERLAY,f=function(t){t.preventDefault(),v()},d=function(t){t.preventDefault(),g()},p=function(t){if(o.default.isOpen)switch(t.key){case"Escape":return r.onAction(a.CANCEL_KEY)}},m=function(t){if(o.default.isOpen)switch(t.key){case"Tab":return f(t)}},b=function(t){if(o.default.isOpen)return"Tab"===t.key&&t.shiftKey?d(t):void 0},v=function(){var t=i.getNode(l);t&&(t.tabIndex=0,t.focus())},g=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l),n=e.length-1,o=e[n];o&&o.focus()},h=function(t){t[t.length-1].addEventListener("keydown",m)},w=function(t){t[0].addEventListener("keydown",b)},y=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l);e.length&&(h(e),w(e))},x=function(t){if(i.getNode(u)===t.target)return r.onAction(a.CANCEL_KEY)},_=function(t){var e=i.getNode(u);e.removeEventListener("click",x),t&&e.addEventListener("click",x)},k=function(t){o.default.timer&&clearTimeout(o.default.timer),t&&(o.default.timer=window.setTimeout(function(){return r.onAction(a.CANCEL_KEY)},t))},O=function(t){t.closeOnEsc?document.addEventListener("keyup",p):document.removeEventListener("keyup",p),t.dangerMode?v():g(),y(),_(t.closeOnClickOutside),k(t.timer)};e.default=O},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(37),a=n(38),s={title:null,text:null,icon:null,buttons:r.defaultButtonList,content:null,className:null,closeOnClickOutside:!0,closeOnEsc:!0,dangerMode:!1,timer:null},c=Object.assign({},s);e.setDefaults=function(t){c=Object.assign({},s,t)};var l=function(t){var e=t&&t.button,n=t&&t.buttons;return void 0!==e&&void 0!==n&&o.throwErr("Cannot set both 'button' and 'buttons' options!"),void 0!==e?{confirm:e}:n},u=function(t){return o.ordinalSuffixOf(t+1)},f=function(t,e){o.throwErr(u(e)+" argument ('"+t+"') is invalid")},d=function(t,e){var n=t+1,r=e[n];o.isPlainObject(r)||void 0===r||o.throwErr("Expected "+u(n)+" argument ('"+r+"') to be a plain object")},p=function(t,e){var n=t+1,r=e[n];void 0!==r&&o.throwErr("Unexpected "+u(n)+" argument ("+r+")")},m=function(t,e,n,r){var i=typeof e,a="string"===i,s=e instanceof Element;if(a){if(0===n)return{text:e};if(1===n)return{text:e,title:r[0]};if(2===n)return d(n,r),{icon:e};f(e,n)}else{if(s&&0===n)return d(n,r),{content:e};if(o.isPlainObject(e))return p(n,r),e;f(e,n)}};e.getOpts=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var n={};t.forEach(function(e,o){var r=m(0,e,o,t);Object.assign(n,r)});var o=l(n);n.buttons=r.getButtonListOpts(o),delete n.button,n.content=i.getContentOpts(n.content);var u=Object.assign({},s,c,n);return Object.keys(u).forEach(function(t){a.DEPRECATED_OPTS[t]&&a.logDeprecation(t)}),u}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r={element:"input",attributes:{placeholder:""}};e.getContentOpts=function(t){var e={};return o.isPlainObject(t)?Object.assign(e,t):t instanceof Element?{element:t}:"input"===t?r:null}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.logDeprecation=function(t){var n=e.DEPRECATED_OPTS[t],o=n.onlyRename,r=n.replacement,i=n.subOption,a=n.link,s=o?"renamed":"deprecated",c='SweetAlert warning: "'+t+'" option has been '+s+".";if(r){c+=" Please use"+(i?' "'+i+'" in ':" ")+'"'+r+'" instead.'}var l="https://sweetalert.js.org";c+=a?" More details: "+l+a:" More details: "+l+"/guides/#upgrading-from-1x",console.warn(c)},e.DEPRECATED_OPTS={type:{replacement:"icon",link:"/docs/#icon"},imageUrl:{replacement:"icon",link:"/docs/#icon"},customClass:{replacement:"className",onlyRename:!0,link:"/docs/#classname"},imageSize:{},showCancelButton:{replacement:"buttons",link:"/docs/#buttons"},showConfirmButton:{replacement:"button",link:"/docs/#button"},confirmButtonText:{replacement:"button",link:"/docs/#button"},confirmButtonColor:{},cancelButtonText:{replacement:"buttons",link:"/docs/#buttons"},closeOnConfirm:{replacement:"button",subOption:"closeModal",link:"/docs/#button"},closeOnCancel:{replacement:"buttons",subOption:"closeModal",link:"/docs/#buttons"},showLoaderOnConfirm:{replacement:"buttons"},animation:{},inputType:{replacement:"content",link:"/docs/#content"},inputValue:{replacement:"content",link:"/docs/#content"},inputPlaceholder:{replacement:"content",link:"/docs/#content"},html:{replacement:"content",link:"/docs/#content"},allowEscapeKey:{replacement:"closeOnEsc",onlyRename:!0,link:"/docs/#closeonesc"},allowClickOutside:{replacement:"closeOnClickOutside",onlyRename:!0,link:"/docs/#closeonclickoutside"}}}])});
/*!
 * Cropper.js v1.4.1
 * https://fengyuanchen.github.io/cropperjs
 *
 * Copyright 2015-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2018-07-15T09:55:31.170Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Cropper = factory());
}(this, (function () { 'use strict';

  var IN_BROWSER = typeof window !== 'undefined';
  var WINDOW = IN_BROWSER ? window : {};
  var NAMESPACE = 'cropper';

  // Actions
  var ACTION_ALL = 'all';
  var ACTION_CROP = 'crop';
  var ACTION_MOVE = 'move';
  var ACTION_ZOOM = 'zoom';
  var ACTION_EAST = 'e';
  var ACTION_WEST = 'w';
  var ACTION_SOUTH = 's';
  var ACTION_NORTH = 'n';
  var ACTION_NORTH_EAST = 'ne';
  var ACTION_NORTH_WEST = 'nw';
  var ACTION_SOUTH_EAST = 'se';
  var ACTION_SOUTH_WEST = 'sw';

  // Classes
  var CLASS_CROP = NAMESPACE + '-crop';
  var CLASS_DISABLED = NAMESPACE + '-disabled';
  var CLASS_HIDDEN = NAMESPACE + '-hidden';
  var CLASS_HIDE = NAMESPACE + '-hide';
  var CLASS_INVISIBLE = NAMESPACE + '-invisible';
  var CLASS_MODAL = NAMESPACE + '-modal';
  var CLASS_MOVE = NAMESPACE + '-move';

  // Data keys
  var DATA_ACTION = NAMESPACE + 'Action';
  var DATA_PREVIEW = NAMESPACE + 'Preview';

  // Drag modes
  var DRAG_MODE_CROP = 'crop';
  var DRAG_MODE_MOVE = 'move';
  var DRAG_MODE_NONE = 'none';

  // Events
  var EVENT_CROP = 'crop';
  var EVENT_CROP_END = 'cropend';
  var EVENT_CROP_MOVE = 'cropmove';
  var EVENT_CROP_START = 'cropstart';
  var EVENT_DBLCLICK = 'dblclick';
  var EVENT_POINTER_DOWN = WINDOW.PointerEvent ? 'pointerdown' : 'touchstart mousedown';
  var EVENT_POINTER_MOVE = WINDOW.PointerEvent ? 'pointermove' : 'touchmove mousemove';
  var EVENT_POINTER_UP = WINDOW.PointerEvent ? 'pointerup pointercancel' : 'touchend touchcancel mouseup';
  var EVENT_READY = 'ready';
  var EVENT_RESIZE = 'resize';
  var EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';
  var EVENT_ZOOM = 'zoom';

  // RegExps
  var REGEXP_ACTIONS = /^(?:e|w|s|n|se|sw|ne|nw|all|crop|move|zoom)$/;
  var REGEXP_DATA_URL = /^data:/;
  var REGEXP_DATA_URL_JPEG = /^data:image\/jpeg;base64,/;
  var REGEXP_TAG_NAME = /^(?:img|canvas)$/i;

  var DEFAULTS = {
    // Define the view mode of the cropper
    viewMode: 0, // 0, 1, 2, 3

    // Define the dragging mode of the cropper
    dragMode: DRAG_MODE_CROP, // 'crop', 'move' or 'none'

    // Define the initial aspect ratio of the crop box
    initialAspectRatio: NaN,

    // Define the aspect ratio of the crop box
    aspectRatio: NaN,

    // An object with the previous cropping result data
    data: null,

    // A selector for adding extra containers to preview
    preview: '',

    // Re-render the cropper when resize the window
    responsive: true,

    // Restore the cropped area after resize the window
    restore: true,

    // Check if the current image is a cross-origin image
    checkCrossOrigin: true,

    // Check the current image's Exif Orientation information
    checkOrientation: true,

    // Show the black modal
    modal: true,

    // Show the dashed lines for guiding
    guides: true,

    // Show the center indicator for guiding
    center: true,

    // Show the white modal to highlight the crop box
    highlight: true,

    // Show the grid background
    background: true,

    // Enable to crop the image automatically when initialize
    autoCrop: true,

    // Define the percentage of automatic cropping area when initializes
    autoCropArea: 0.8,

    // Enable to move the image
    movable: true,

    // Enable to rotate the image
    rotatable: true,

    // Enable to scale the image
    scalable: true,

    // Enable to zoom the image
    zoomable: true,

    // Enable to zoom the image by dragging touch
    zoomOnTouch: true,

    // Enable to zoom the image by wheeling mouse
    zoomOnWheel: true,

    // Define zoom ratio when zoom the image by wheeling mouse
    wheelZoomRatio: 0.1,

    // Enable to move the crop box
    cropBoxMovable: true,

    // Enable to resize the crop box
    cropBoxResizable: true,

    // Toggle drag mode between "crop" and "move" when click twice on the cropper
    toggleDragModeOnDblclick: true,

    // Size limitation
    minCanvasWidth: 0,
    minCanvasHeight: 0,
    minCropBoxWidth: 0,
    minCropBoxHeight: 0,
    minContainerWidth: 200,
    minContainerHeight: 100,

    // Shortcuts of events
    ready: null,
    cropstart: null,
    cropmove: null,
    cropend: null,
    crop: null,
    zoom: null
  };

  var TEMPLATE = '<div class="cropper-container" touch-action="none">' + '<div class="cropper-wrap-box">' + '<div class="cropper-canvas"></div>' + '</div>' + '<div class="cropper-drag-box"></div>' + '<div class="cropper-crop-box">' + '<span class="cropper-view-box"></span>' + '<span class="cropper-dashed dashed-h"></span>' + '<span class="cropper-dashed dashed-v"></span>' + '<span class="cropper-center"></span>' + '<span class="cropper-face"></span>' + '<span class="cropper-line line-e" data-cropper-action="e"></span>' + '<span class="cropper-line line-n" data-cropper-action="n"></span>' + '<span class="cropper-line line-w" data-cropper-action="w"></span>' + '<span class="cropper-line line-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-e" data-cropper-action="e"></span>' + '<span class="cropper-point point-n" data-cropper-action="n"></span>' + '<span class="cropper-point point-w" data-cropper-action="w"></span>' + '<span class="cropper-point point-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-ne" data-cropper-action="ne"></span>' + '<span class="cropper-point point-nw" data-cropper-action="nw"></span>' + '<span class="cropper-point point-sw" data-cropper-action="sw"></span>' + '<span class="cropper-point point-se" data-cropper-action="se"></span>' + '</div>' + '</div>';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /**
   * Check if the given value is not a number.
   */
  var isNaN = Number.isNaN || WINDOW.isNaN;

  /**
   * Check if the given value is a number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a number, else `false`.
   */
  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Check if the given value is undefined.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
   */
  function isUndefined(value) {
    return typeof value === 'undefined';
  }

  /**
   * Check if the given value is an object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is an object, else `false`.
   */
  function isObject(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * Check if the given value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
   */

  function isPlainObject(value) {
    if (!isObject(value)) {
      return false;
    }

    try {
      var _constructor = value.constructor;
      var prototype = _constructor.prototype;


      return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if the given value is a function.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a function, else `false`.
   */
  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Iterate the given data.
   * @param {*} data - The data to iterate.
   * @param {Function} callback - The process function for each element.
   * @returns {*} The original data.
   */
  function forEach(data, callback) {
    if (data && isFunction(callback)) {
      if (Array.isArray(data) || isNumber(data.length) /* array-like */) {
          var length = data.length;

          var i = void 0;

          for (i = 0; i < length; i += 1) {
            if (callback.call(data, data[i], i, data) === false) {
              break;
            }
          }
        } else if (isObject(data)) {
        Object.keys(data).forEach(function (key) {
          callback.call(data, data[key], key, data);
        });
      }
    }

    return data;
  }

  /**
   * Extend the given object.
   * @param {*} obj - The object to be extended.
   * @param {*} args - The rest objects which will be merged to the first object.
   * @returns {Object} The extended object.
   */
  var assign = Object.assign || function assign(obj) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isObject(obj) && args.length > 0) {
      args.forEach(function (arg) {
        if (isObject(arg)) {
          Object.keys(arg).forEach(function (key) {
            obj[key] = arg[key];
          });
        }
      });
    }

    return obj;
  };

  var REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/i;

  /**
   * Normalize decimal number.
   * Check out {@link http://0.30000000000000004.com/}
   * @param {number} value - The value to normalize.
   * @param {number} [times=100000000000] - The times for normalizing.
   * @returns {number} Returns the normalized number.
   */
  function normalizeDecimalNumber(value) {
    var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100000000000;

    return REGEXP_DECIMALS.test(value) ? Math.round(value * times) / times : value;
  }

  var REGEXP_SUFFIX = /^(?:width|height|left|top|marginLeft|marginTop)$/;

  /**
   * Apply styles to the given element.
   * @param {Element} element - The target element.
   * @param {Object} styles - The styles for applying.
   */
  function setStyle(element, styles) {
    var style = element.style;


    forEach(styles, function (value, property) {
      if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
        value += 'px';
      }

      style[property] = value;
    });
  }

  /**
   * Check if the given element has a special class.
   * @param {Element} element - The element to check.
   * @param {string} value - The class to search.
   * @returns {boolean} Returns `true` if the special class was found.
   */
  function hasClass(element, value) {
    return element.classList ? element.classList.contains(value) : element.className.indexOf(value) > -1;
  }

  /**
   * Add classes to the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be added.
   */
  function addClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        addClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.add(value);
      return;
    }

    var className = element.className.trim();

    if (!className) {
      element.className = value;
    } else if (className.indexOf(value) < 0) {
      element.className = className + ' ' + value;
    }
  }

  /**
   * Remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be removed.
   */
  function removeClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        removeClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.remove(value);
      return;
    }

    if (element.className.indexOf(value) >= 0) {
      element.className = element.className.replace(value, '');
    }
  }

  /**
   * Add or remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be toggled.
   * @param {boolean} added - Add only.
   */
  function toggleClass(element, value, added) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        toggleClass(elem, value, added);
      });
      return;
    }

    // IE10-11 doesn't support the second parameter of `classList.toggle`
    if (added) {
      addClass(element, value);
    } else {
      removeClass(element, value);
    }
  }

  var REGEXP_HYPHENATE = /([a-z\d])([A-Z])/g;

  /**
   * Transform the given string from camelCase to kebab-case
   * @param {string} value - The value to transform.
   * @returns {string} The transformed value.
   */
  function hyphenate(value) {
    return value.replace(REGEXP_HYPHENATE, '$1-$2').toLowerCase();
  }

  /**
   * Get data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to get.
   * @returns {string} The data value.
   */
  function getData(element, name) {
    if (isObject(element[name])) {
      return element[name];
    }

    if (element.dataset) {
      return element.dataset[name];
    }

    return element.getAttribute('data-' + hyphenate(name));
  }

  /**
   * Set data to the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to set.
   * @param {string} data - The data value.
   */
  function setData(element, name, data) {
    if (isObject(data)) {
      element[name] = data;
    } else if (element.dataset) {
      element.dataset[name] = data;
    } else {
      element.setAttribute('data-' + hyphenate(name), data);
    }
  }

  /**
   * Remove data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to remove.
   */
  function removeData(element, name) {
    if (isObject(element[name])) {
      try {
        delete element[name];
      } catch (e) {
        element[name] = undefined;
      }
    } else if (element.dataset) {
      // #128 Safari not allows to delete dataset property
      try {
        delete element.dataset[name];
      } catch (e) {
        element.dataset[name] = undefined;
      }
    } else {
      element.removeAttribute('data-' + hyphenate(name));
    }
  }

  var REGEXP_SPACES = /\s\s*/;
  var onceSupported = function () {
    var supported = false;

    if (IN_BROWSER) {
      var once = false;
      var listener = function listener() {};
      var options = Object.defineProperty({}, 'once', {
        get: function get$$1() {
          supported = true;
          return once;
        },


        /**
         * This setter can fix a `TypeError` in strict mode
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
         * @param {boolean} value - The value to set
         */
        set: function set$$1(value) {
          once = value;
        }
      });

      WINDOW.addEventListener('test', listener, options);
      WINDOW.removeEventListener('test', listener, options);
    }

    return supported;
  }();

  /**
   * Remove event listener from the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  function removeListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var handler = listener;

    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (!onceSupported) {
        var listeners = element.listeners;


        if (listeners && listeners[event] && listeners[event][listener]) {
          handler = listeners[event][listener];
          delete listeners[event][listener];

          if (Object.keys(listeners[event]).length === 0) {
            delete listeners[event];
          }

          if (Object.keys(listeners).length === 0) {
            delete element.listeners;
          }
        }
      }

      element.removeEventListener(event, handler, options);
    });
  }

  /**
   * Add event listener to the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  function addListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var _handler = listener;

    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (options.once && !onceSupported) {
        var _element$listeners = element.listeners,
            listeners = _element$listeners === undefined ? {} : _element$listeners;


        _handler = function handler() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          delete listeners[event][listener];
          element.removeEventListener(event, _handler, options);
          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(event, listeners[event][listener], options);
        }

        listeners[event][listener] = _handler;
        element.listeners = listeners;
      }

      element.addEventListener(event, _handler, options);
    });
  }

  /**
   * Dispatch event on the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Object} data - The additional event data.
   * @returns {boolean} Indicate if the event is default prevented or not.
   */
  function dispatchEvent(element, type, data) {
    var event = void 0;

    // Event and CustomEvent on IE9-11 are global objects, not constructors
    if (isFunction(Event) && isFunction(CustomEvent)) {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, data);
    }

    return element.dispatchEvent(event);
  }

  /**
   * Get the offset base on the document.
   * @param {Element} element - The target element.
   * @returns {Object} The offset data.
   */
  function getOffset(element) {
    var box = element.getBoundingClientRect();

    return {
      left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
      top: box.top + (window.pageYOffset - document.documentElement.clientTop)
    };
  }

  var location = WINDOW.location;

  var REGEXP_ORIGINS = /^(https?:)\/\/([^:/?#]+):?(\d*)/i;

  /**
   * Check if the given URL is a cross origin URL.
   * @param {string} url - The target URL.
   * @returns {boolean} Returns `true` if the given URL is a cross origin URL, else `false`.
   */
  function isCrossOriginURL(url) {
    var parts = url.match(REGEXP_ORIGINS);

    return parts && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
  }

  /**
   * Add timestamp to the given URL.
   * @param {string} url - The target URL.
   * @returns {string} The result URL.
   */
  function addTimestamp(url) {
    var timestamp = 'timestamp=' + new Date().getTime();

    return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
  }

  /**
   * Get transforms base on the given object.
   * @param {Object} obj - The target object.
   * @returns {string} A string contains transform values.
   */
  function getTransforms(_ref) {
    var rotate = _ref.rotate,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        translateX = _ref.translateX,
        translateY = _ref.translateY;

    var values = [];

    if (isNumber(translateX) && translateX !== 0) {
      values.push('translateX(' + translateX + 'px)');
    }

    if (isNumber(translateY) && translateY !== 0) {
      values.push('translateY(' + translateY + 'px)');
    }

    // Rotate should come first before scale to match orientation transform
    if (isNumber(rotate) && rotate !== 0) {
      values.push('rotate(' + rotate + 'deg)');
    }

    if (isNumber(scaleX) && scaleX !== 1) {
      values.push('scaleX(' + scaleX + ')');
    }

    if (isNumber(scaleY) && scaleY !== 1) {
      values.push('scaleY(' + scaleY + ')');
    }

    var transform = values.length ? values.join(' ') : 'none';

    return {
      WebkitTransform: transform,
      msTransform: transform,
      transform: transform
    };
  }

  /**
   * Get the max ratio of a group of pointers.
   * @param {string} pointers - The target pointers.
   * @returns {number} The result ratio.
   */
  function getMaxZoomRatio(pointers) {
    var pointers2 = assign({}, pointers);
    var ratios = [];

    forEach(pointers, function (pointer, pointerId) {
      delete pointers2[pointerId];

      forEach(pointers2, function (pointer2) {
        var x1 = Math.abs(pointer.startX - pointer2.startX);
        var y1 = Math.abs(pointer.startY - pointer2.startY);
        var x2 = Math.abs(pointer.endX - pointer2.endX);
        var y2 = Math.abs(pointer.endY - pointer2.endY);
        var z1 = Math.sqrt(x1 * x1 + y1 * y1);
        var z2 = Math.sqrt(x2 * x2 + y2 * y2);
        var ratio = (z2 - z1) / z1;

        ratios.push(ratio);
      });
    });

    ratios.sort(function (a, b) {
      return Math.abs(a) < Math.abs(b);
    });

    return ratios[0];
  }

  /**
   * Get a pointer from an event object.
   * @param {Object} event - The target event object.
   * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
   * @returns {Object} The result pointer contains start and/or end point coordinates.
   */
  function getPointer(_ref2, endOnly) {
    var pageX = _ref2.pageX,
        pageY = _ref2.pageY;

    var end = {
      endX: pageX,
      endY: pageY
    };

    return endOnly ? end : assign({
      startX: pageX,
      startY: pageY
    }, end);
  }

  /**
   * Get the center point coordinate of a group of pointers.
   * @param {Object} pointers - The target pointers.
   * @returns {Object} The center point coordinate.
   */
  function getPointersCenter(pointers) {
    var pageX = 0;
    var pageY = 0;
    var count = 0;

    forEach(pointers, function (_ref3) {
      var startX = _ref3.startX,
          startY = _ref3.startY;

      pageX += startX;
      pageY += startY;
      count += 1;
    });

    pageX /= count;
    pageY /= count;

    return {
      pageX: pageX,
      pageY: pageY
    };
  }

  /**
   * Check if the given value is a finite number.
   */
  var isFinite = Number.isFinite || WINDOW.isFinite;

  /**
   * Get the max sizes in a rectangle under the given aspect ratio.
   * @param {Object} data - The original sizes.
   * @param {string} [type='contain'] - The adjust type.
   * @returns {Object} The result sizes.
   */
  function getAdjustedSizes(_ref4) // or 'cover'
  {
    var aspectRatio = _ref4.aspectRatio,
        height = _ref4.height,
        width = _ref4.width;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'contain';

    var isValidNumber = function isValidNumber(value) {
      return isFinite(value) && value > 0;
    };

    if (isValidNumber(width) && isValidNumber(height)) {
      var adjustedWidth = height * aspectRatio;

      if (type === 'contain' && adjustedWidth > width || type === 'cover' && adjustedWidth < width) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    } else if (isValidNumber(width)) {
      height = width / aspectRatio;
    } else if (isValidNumber(height)) {
      width = height * aspectRatio;
    }

    return {
      width: width,
      height: height
    };
  }

  /**
   * Get the new sizes of a rectangle after rotated.
   * @param {Object} data - The original sizes.
   * @returns {Object} The result sizes.
   */
  function getRotatedSizes(_ref5) {
    var width = _ref5.width,
        height = _ref5.height,
        degree = _ref5.degree;

    degree = Math.abs(degree) % 180;

    if (degree === 90) {
      return {
        width: height,
        height: width
      };
    }

    var arc = degree % 90 * Math.PI / 180;
    var sinArc = Math.sin(arc);
    var cosArc = Math.cos(arc);
    var newWidth = width * cosArc + height * sinArc;
    var newHeight = width * sinArc + height * cosArc;

    return degree > 90 ? {
      width: newHeight,
      height: newWidth
    } : {
      width: newWidth,
      height: newHeight
    };
  }

  /**
   * Get a canvas which drew the given image.
   * @param {HTMLImageElement} image - The image for drawing.
   * @param {Object} imageData - The image data.
   * @param {Object} canvasData - The canvas data.
   * @param {Object} options - The options.
   * @returns {HTMLCanvasElement} The result canvas.
   */
  function getSourceCanvas(image, _ref6, _ref7, _ref8) {
    var imageAspectRatio = _ref6.aspectRatio,
        imageNaturalWidth = _ref6.naturalWidth,
        imageNaturalHeight = _ref6.naturalHeight,
        _ref6$rotate = _ref6.rotate,
        rotate = _ref6$rotate === undefined ? 0 : _ref6$rotate,
        _ref6$scaleX = _ref6.scaleX,
        scaleX = _ref6$scaleX === undefined ? 1 : _ref6$scaleX,
        _ref6$scaleY = _ref6.scaleY,
        scaleY = _ref6$scaleY === undefined ? 1 : _ref6$scaleY;
    var aspectRatio = _ref7.aspectRatio,
        naturalWidth = _ref7.naturalWidth,
        naturalHeight = _ref7.naturalHeight;
    var _ref8$fillColor = _ref8.fillColor,
        fillColor = _ref8$fillColor === undefined ? 'transparent' : _ref8$fillColor,
        _ref8$imageSmoothingE = _ref8.imageSmoothingEnabled,
        imageSmoothingEnabled = _ref8$imageSmoothingE === undefined ? true : _ref8$imageSmoothingE,
        _ref8$imageSmoothingQ = _ref8.imageSmoothingQuality,
        imageSmoothingQuality = _ref8$imageSmoothingQ === undefined ? 'low' : _ref8$imageSmoothingQ,
        _ref8$maxWidth = _ref8.maxWidth,
        maxWidth = _ref8$maxWidth === undefined ? Infinity : _ref8$maxWidth,
        _ref8$maxHeight = _ref8.maxHeight,
        maxHeight = _ref8$maxHeight === undefined ? Infinity : _ref8$maxHeight,
        _ref8$minWidth = _ref8.minWidth,
        minWidth = _ref8$minWidth === undefined ? 0 : _ref8$minWidth,
        _ref8$minHeight = _ref8.minHeight,
        minHeight = _ref8$minHeight === undefined ? 0 : _ref8$minHeight;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var maxSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var minSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
    var height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight));

    // Note: should always use image's natural sizes for drawing as
    // imageData.naturalWidth === canvasData.naturalHeight when rotate % 180 === 90
    var destMaxSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var destMinSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var destWidth = Math.min(destMaxSizes.width, Math.max(destMinSizes.width, imageNaturalWidth));
    var destHeight = Math.min(destMaxSizes.height, Math.max(destMinSizes.height, imageNaturalHeight));
    var params = [-destWidth / 2, -destHeight / 2, destWidth, destHeight];

    canvas.width = normalizeDecimalNumber(width);
    canvas.height = normalizeDecimalNumber(height);
    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(rotate * Math.PI / 180);
    context.scale(scaleX, scaleY);
    context.imageSmoothingEnabled = imageSmoothingEnabled;
    context.imageSmoothingQuality = imageSmoothingQuality;
    context.drawImage.apply(context, [image].concat(toConsumableArray(params.map(function (param) {
      return Math.floor(normalizeDecimalNumber(param));
    }))));
    context.restore();
    return canvas;
  }

  var fromCharCode = String.fromCharCode;

  /**
   * Get string from char code in data view.
   * @param {DataView} dataView - The data view for read.
   * @param {number} start - The start index.
   * @param {number} length - The read length.
   * @returns {string} The read result.
   */

  function getStringFromCharCode(dataView, start, length) {
    var str = '';
    var i = void 0;

    length += start;

    for (i = start; i < length; i += 1) {
      str += fromCharCode(dataView.getUint8(i));
    }

    return str;
  }

  var REGEXP_DATA_URL_HEAD = /^data:.*,/;

  /**
   * Transform Data URL to array buffer.
   * @param {string} dataURL - The Data URL to transform.
   * @returns {ArrayBuffer} The result array buffer.
   */
  function dataURLToArrayBuffer(dataURL) {
    var base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
    var binary = atob(base64);
    var arrayBuffer = new ArrayBuffer(binary.length);
    var uint8 = new Uint8Array(arrayBuffer);

    forEach(uint8, function (value, i) {
      uint8[i] = binary.charCodeAt(i);
    });

    return arrayBuffer;
  }

  /**
   * Transform array buffer to Data URL.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
   * @param {string} mimeType - The mime type of the Data URL.
   * @returns {string} The result Data URL.
   */
  function arrayBufferToDataURL(arrayBuffer, mimeType) {
    var uint8 = new Uint8Array(arrayBuffer);
    var data = '';

    // TypedArray.prototype.forEach is not supported in some browsers as IE.
    if (isFunction(uint8.forEach)) {
      // Use native `forEach` method first for better performance
      uint8.forEach(function (value) {
        data += fromCharCode(value);
      });
    } else {
      forEach(uint8, function (value) {
        data += fromCharCode(value);
      });
    }

    return 'data:' + mimeType + ';base64,' + btoa(data);
  }

  /**
   * Get orientation value from given array buffer.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
   * @returns {number} The read orientation value.
   */
  function getOrientation(arrayBuffer) {
    var dataView = new DataView(arrayBuffer);
    var orientation = void 0;
    var littleEndian = void 0;
    var app1Start = void 0;
    var ifdStart = void 0;

    // Only handle JPEG image (start by 0xFFD8)
    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
      var length = dataView.byteLength;
      var offset = 2;

      while (offset < length) {
        if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
          app1Start = offset;
          break;
        }

        offset += 1;
      }
    }

    if (app1Start) {
      var exifIDCode = app1Start + 4;
      var tiffOffset = app1Start + 10;

      if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
        var endianness = dataView.getUint16(tiffOffset);

        littleEndian = endianness === 0x4949;

        if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
            if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
              var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

              if (firstIFDOffset >= 0x00000008) {
                ifdStart = tiffOffset + firstIFDOffset;
              }
            }
          }
      }
    }

    if (ifdStart) {
      var _length = dataView.getUint16(ifdStart, littleEndian);
      var _offset = void 0;
      var i = void 0;

      for (i = 0; i < _length; i += 1) {
        _offset = ifdStart + i * 12 + 2;

        if (dataView.getUint16(_offset, littleEndian) === 0x0112 /* Orientation */) {
            // 8 is the offset of the current tag's value
            _offset += 8;

            // Get the original orientation value
            orientation = dataView.getUint16(_offset, littleEndian);

            // Override the orientation with its default value
            dataView.setUint16(_offset, 1, littleEndian);
            break;
          }
      }
    }

    return orientation;
  }

  /**
   * Parse Exif Orientation value.
   * @param {number} orientation - The orientation to parse.
   * @returns {Object} The parsed result.
   */
  function parseOrientation(orientation) {
    var rotate = 0;
    var scaleX = 1;
    var scaleY = 1;

    switch (orientation) {
      // Flip horizontal
      case 2:
        scaleX = -1;
        break;

      // Rotate left 180°
      case 3:
        rotate = -180;
        break;

      // Flip vertical
      case 4:
        scaleY = -1;
        break;

      // Flip vertical and rotate right 90°
      case 5:
        rotate = 90;
        scaleY = -1;
        break;

      // Rotate right 90°
      case 6:
        rotate = 90;
        break;

      // Flip horizontal and rotate right 90°
      case 7:
        rotate = 90;
        scaleX = -1;
        break;

      // Rotate left 90°
      case 8:
        rotate = -90;
        break;

      default:
    }

    return {
      rotate: rotate,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var render = {
    render: function render() {
      this.initContainer();
      this.initCanvas();
      this.initCropBox();
      this.renderCanvas();

      if (this.cropped) {
        this.renderCropBox();
      }
    },
    initContainer: function initContainer() {
      var element = this.element,
          options = this.options,
          container = this.container,
          cropper = this.cropper;


      addClass(cropper, CLASS_HIDDEN);
      removeClass(element, CLASS_HIDDEN);

      var containerData = {
        width: Math.max(container.offsetWidth, Number(options.minContainerWidth) || 200),
        height: Math.max(container.offsetHeight, Number(options.minContainerHeight) || 100)
      };

      this.containerData = containerData;

      setStyle(cropper, {
        width: containerData.width,
        height: containerData.height
      });

      addClass(element, CLASS_HIDDEN);
      removeClass(cropper, CLASS_HIDDEN);
    },


    // Canvas (image wrapper)
    initCanvas: function initCanvas() {
      var containerData = this.containerData,
          imageData = this.imageData;
      var viewMode = this.options.viewMode;

      var rotated = Math.abs(imageData.rotate) % 180 === 90;
      var naturalWidth = rotated ? imageData.naturalHeight : imageData.naturalWidth;
      var naturalHeight = rotated ? imageData.naturalWidth : imageData.naturalHeight;
      var aspectRatio = naturalWidth / naturalHeight;
      var canvasWidth = containerData.width;
      var canvasHeight = containerData.height;

      if (containerData.height * aspectRatio > containerData.width) {
        if (viewMode === 3) {
          canvasWidth = containerData.height * aspectRatio;
        } else {
          canvasHeight = containerData.width / aspectRatio;
        }
      } else if (viewMode === 3) {
        canvasHeight = containerData.width / aspectRatio;
      } else {
        canvasWidth = containerData.height * aspectRatio;
      }

      var canvasData = {
        aspectRatio: aspectRatio,
        naturalWidth: naturalWidth,
        naturalHeight: naturalHeight,
        width: canvasWidth,
        height: canvasHeight
      };

      canvasData.left = (containerData.width - canvasWidth) / 2;
      canvasData.top = (containerData.height - canvasHeight) / 2;
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;

      this.canvasData = canvasData;
      this.limited = viewMode === 1 || viewMode === 2;
      this.limitCanvas(true, true);
      this.initialImageData = assign({}, imageData);
      this.initialCanvasData = assign({}, canvasData);
    },
    limitCanvas: function limitCanvas(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var viewMode = options.viewMode;
      var aspectRatio = canvasData.aspectRatio;

      var cropped = this.cropped && cropBoxData;

      if (sizeLimited) {
        var minCanvasWidth = Number(options.minCanvasWidth) || 0;
        var minCanvasHeight = Number(options.minCanvasHeight) || 0;

        if (viewMode > 1) {
          minCanvasWidth = Math.max(minCanvasWidth, containerData.width);
          minCanvasHeight = Math.max(minCanvasHeight, containerData.height);

          if (viewMode === 3) {
            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        } else if (viewMode > 0) {
          if (minCanvasWidth) {
            minCanvasWidth = Math.max(minCanvasWidth, cropped ? cropBoxData.width : 0);
          } else if (minCanvasHeight) {
            minCanvasHeight = Math.max(minCanvasHeight, cropped ? cropBoxData.height : 0);
          } else if (cropped) {
            minCanvasWidth = cropBoxData.width;
            minCanvasHeight = cropBoxData.height;

            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        }

        var _getAdjustedSizes = getAdjustedSizes({
          aspectRatio: aspectRatio,
          width: minCanvasWidth,
          height: minCanvasHeight
        });

        minCanvasWidth = _getAdjustedSizes.width;
        minCanvasHeight = _getAdjustedSizes.height;


        canvasData.minWidth = minCanvasWidth;
        canvasData.minHeight = minCanvasHeight;
        canvasData.maxWidth = Infinity;
        canvasData.maxHeight = Infinity;
      }

      if (positionLimited) {
        if (viewMode > (cropped ? 0 : 1)) {
          var newCanvasLeft = containerData.width - canvasData.width;
          var newCanvasTop = containerData.height - canvasData.height;

          canvasData.minLeft = Math.min(0, newCanvasLeft);
          canvasData.minTop = Math.min(0, newCanvasTop);
          canvasData.maxLeft = Math.max(0, newCanvasLeft);
          canvasData.maxTop = Math.max(0, newCanvasTop);

          if (cropped && this.limited) {
            canvasData.minLeft = Math.min(cropBoxData.left, cropBoxData.left + (cropBoxData.width - canvasData.width));
            canvasData.minTop = Math.min(cropBoxData.top, cropBoxData.top + (cropBoxData.height - canvasData.height));
            canvasData.maxLeft = cropBoxData.left;
            canvasData.maxTop = cropBoxData.top;

            if (viewMode === 2) {
              if (canvasData.width >= containerData.width) {
                canvasData.minLeft = Math.min(0, newCanvasLeft);
                canvasData.maxLeft = Math.max(0, newCanvasLeft);
              }

              if (canvasData.height >= containerData.height) {
                canvasData.minTop = Math.min(0, newCanvasTop);
                canvasData.maxTop = Math.max(0, newCanvasTop);
              }
            }
          }
        } else {
          canvasData.minLeft = -canvasData.width;
          canvasData.minTop = -canvasData.height;
          canvasData.maxLeft = containerData.width;
          canvasData.maxTop = containerData.height;
        }
      }
    },
    renderCanvas: function renderCanvas(changed, transformed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;


      if (transformed) {
        var _getRotatedSizes = getRotatedSizes({
          width: imageData.naturalWidth * Math.abs(imageData.scaleX || 1),
          height: imageData.naturalHeight * Math.abs(imageData.scaleY || 1),
          degree: imageData.rotate || 0
        }),
            naturalWidth = _getRotatedSizes.width,
            naturalHeight = _getRotatedSizes.height;

        var width = canvasData.width * (naturalWidth / canvasData.naturalWidth);
        var height = canvasData.height * (naturalHeight / canvasData.naturalHeight);

        canvasData.left -= (width - canvasData.width) / 2;
        canvasData.top -= (height - canvasData.height) / 2;
        canvasData.width = width;
        canvasData.height = height;
        canvasData.aspectRatio = naturalWidth / naturalHeight;
        canvasData.naturalWidth = naturalWidth;
        canvasData.naturalHeight = naturalHeight;
        this.limitCanvas(true, false);
      }

      if (canvasData.width > canvasData.maxWidth || canvasData.width < canvasData.minWidth) {
        canvasData.left = canvasData.oldLeft;
      }

      if (canvasData.height > canvasData.maxHeight || canvasData.height < canvasData.minHeight) {
        canvasData.top = canvasData.oldTop;
      }

      canvasData.width = Math.min(Math.max(canvasData.width, canvasData.minWidth), canvasData.maxWidth);
      canvasData.height = Math.min(Math.max(canvasData.height, canvasData.minHeight), canvasData.maxHeight);

      this.limitCanvas(false, true);

      canvasData.left = Math.min(Math.max(canvasData.left, canvasData.minLeft), canvasData.maxLeft);
      canvasData.top = Math.min(Math.max(canvasData.top, canvasData.minTop), canvasData.maxTop);
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;

      setStyle(this.canvas, assign({
        width: canvasData.width,
        height: canvasData.height
      }, getTransforms({
        translateX: canvasData.left,
        translateY: canvasData.top
      })));

      this.renderImage(changed);

      if (this.cropped && this.limited) {
        this.limitCropBox(true, true);
      }
    },
    renderImage: function renderImage(changed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;

      var width = imageData.naturalWidth * (canvasData.width / canvasData.naturalWidth);
      var height = imageData.naturalHeight * (canvasData.height / canvasData.naturalHeight);

      assign(imageData, {
        width: width,
        height: height,
        left: (canvasData.width - width) / 2,
        top: (canvasData.height - height) / 2
      });
      setStyle(this.image, assign({
        width: imageData.width,
        height: imageData.height
      }, getTransforms(assign({
        translateX: imageData.left,
        translateY: imageData.top
      }, imageData))));

      if (changed) {
        this.output();
      }
    },
    initCropBox: function initCropBox() {
      var options = this.options,
          canvasData = this.canvasData;

      var aspectRatio = options.aspectRatio || options.initialAspectRatio;
      var autoCropArea = Number(options.autoCropArea) || 0.8;
      var cropBoxData = {
        width: canvasData.width,
        height: canvasData.height
      };

      if (aspectRatio) {
        if (canvasData.height * aspectRatio > canvasData.width) {
          cropBoxData.height = cropBoxData.width / aspectRatio;
        } else {
          cropBoxData.width = cropBoxData.height * aspectRatio;
        }
      }

      this.cropBoxData = cropBoxData;
      this.limitCropBox(true, true);

      // Initialize auto crop area
      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);

      // The width/height of auto crop area must large than "minWidth/Height"
      cropBoxData.width = Math.max(cropBoxData.minWidth, cropBoxData.width * autoCropArea);
      cropBoxData.height = Math.max(cropBoxData.minHeight, cropBoxData.height * autoCropArea);
      cropBoxData.left = canvasData.left + (canvasData.width - cropBoxData.width) / 2;
      cropBoxData.top = canvasData.top + (canvasData.height - cropBoxData.height) / 2;
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;

      this.initialCropBoxData = assign({}, cropBoxData);
    },
    limitCropBox: function limitCropBox(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData,
          limited = this.limited;
      var aspectRatio = options.aspectRatio;


      if (sizeLimited) {
        var minCropBoxWidth = Number(options.minCropBoxWidth) || 0;
        var minCropBoxHeight = Number(options.minCropBoxHeight) || 0;
        var maxCropBoxWidth = limited ? Math.min(containerData.width, canvasData.width, canvasData.width + canvasData.left, containerData.width - canvasData.left) : containerData.width;
        var maxCropBoxHeight = limited ? Math.min(containerData.height, canvasData.height, canvasData.height + canvasData.top, containerData.height - canvasData.top) : containerData.height;

        // The min/maxCropBoxWidth/Height must be less than container's width/height
        minCropBoxWidth = Math.min(minCropBoxWidth, containerData.width);
        minCropBoxHeight = Math.min(minCropBoxHeight, containerData.height);

        if (aspectRatio) {
          if (minCropBoxWidth && minCropBoxHeight) {
            if (minCropBoxHeight * aspectRatio > minCropBoxWidth) {
              minCropBoxHeight = minCropBoxWidth / aspectRatio;
            } else {
              minCropBoxWidth = minCropBoxHeight * aspectRatio;
            }
          } else if (minCropBoxWidth) {
            minCropBoxHeight = minCropBoxWidth / aspectRatio;
          } else if (minCropBoxHeight) {
            minCropBoxWidth = minCropBoxHeight * aspectRatio;
          }

          if (maxCropBoxHeight * aspectRatio > maxCropBoxWidth) {
            maxCropBoxHeight = maxCropBoxWidth / aspectRatio;
          } else {
            maxCropBoxWidth = maxCropBoxHeight * aspectRatio;
          }
        }

        // The minWidth/Height must be less than maxWidth/Height
        cropBoxData.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
        cropBoxData.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
        cropBoxData.maxWidth = maxCropBoxWidth;
        cropBoxData.maxHeight = maxCropBoxHeight;
      }

      if (positionLimited) {
        if (limited) {
          cropBoxData.minLeft = Math.max(0, canvasData.left);
          cropBoxData.minTop = Math.max(0, canvasData.top);
          cropBoxData.maxLeft = Math.min(containerData.width, canvasData.left + canvasData.width) - cropBoxData.width;
          cropBoxData.maxTop = Math.min(containerData.height, canvasData.top + canvasData.height) - cropBoxData.height;
        } else {
          cropBoxData.minLeft = 0;
          cropBoxData.minTop = 0;
          cropBoxData.maxLeft = containerData.width - cropBoxData.width;
          cropBoxData.maxTop = containerData.height - cropBoxData.height;
        }
      }
    },
    renderCropBox: function renderCropBox() {
      var options = this.options,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData;


      if (cropBoxData.width > cropBoxData.maxWidth || cropBoxData.width < cropBoxData.minWidth) {
        cropBoxData.left = cropBoxData.oldLeft;
      }

      if (cropBoxData.height > cropBoxData.maxHeight || cropBoxData.height < cropBoxData.minHeight) {
        cropBoxData.top = cropBoxData.oldTop;
      }

      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);

      this.limitCropBox(false, true);

      cropBoxData.left = Math.min(Math.max(cropBoxData.left, cropBoxData.minLeft), cropBoxData.maxLeft);
      cropBoxData.top = Math.min(Math.max(cropBoxData.top, cropBoxData.minTop), cropBoxData.maxTop);
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;

      if (options.movable && options.cropBoxMovable) {
        // Turn to move the canvas when the crop box is equal to the container
        setData(this.face, DATA_ACTION, cropBoxData.width >= containerData.width && cropBoxData.height >= containerData.height ? ACTION_MOVE : ACTION_ALL);
      }

      setStyle(this.cropBox, assign({
        width: cropBoxData.width,
        height: cropBoxData.height
      }, getTransforms({
        translateX: cropBoxData.left,
        translateY: cropBoxData.top
      })));

      if (this.cropped && this.limited) {
        this.limitCanvas(true, true);
      }

      if (!this.disabled) {
        this.output();
      }
    },
    output: function output() {
      this.preview();
      dispatchEvent(this.element, EVENT_CROP, this.getData());
    }
  };

  var preview = {
    initPreview: function initPreview() {
      var crossOrigin = this.crossOrigin;
      var preview = this.options.preview;

      var url = crossOrigin ? this.crossOriginUrl : this.url;
      var image = document.createElement('img');

      if (crossOrigin) {
        image.crossOrigin = crossOrigin;
      }

      image.src = url;
      this.viewBox.appendChild(image);
      this.viewBoxImage = image;

      if (!preview) {
        return;
      }

      var previews = preview;

      if (typeof preview === 'string') {
        previews = this.element.ownerDocument.querySelectorAll(preview);
      } else if (preview.querySelector) {
        previews = [preview];
      }

      this.previews = previews;

      forEach(previews, function (el) {
        var img = document.createElement('img');

        // Save the original size for recover
        setData(el, DATA_PREVIEW, {
          width: el.offsetWidth,
          height: el.offsetHeight,
          html: el.innerHTML
        });

        if (crossOrigin) {
          img.crossOrigin = crossOrigin;
        }

        img.src = url;

        /**
         * Override img element styles
         * Add `display:block` to avoid margin top issue
         * Add `height:auto` to override `height` attribute on IE8
         * (Occur only when margin-top <= -height)
         */
        img.style.cssText = 'display:block;' + 'width:100%;' + 'height:auto;' + 'min-width:0!important;' + 'min-height:0!important;' + 'max-width:none!important;' + 'max-height:none!important;' + 'image-orientation:0deg!important;"';

        el.innerHTML = '';
        el.appendChild(img);
      });
    },
    resetPreview: function resetPreview() {
      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);

        setStyle(element, {
          width: data.width,
          height: data.height
        });

        element.innerHTML = data.html;
        removeData(element, DATA_PREVIEW);
      });
    },
    preview: function preview() {
      var imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var cropBoxWidth = cropBoxData.width,
          cropBoxHeight = cropBoxData.height;
      var width = imageData.width,
          height = imageData.height;

      var left = cropBoxData.left - canvasData.left - imageData.left;
      var top = cropBoxData.top - canvasData.top - imageData.top;

      if (!this.cropped || this.disabled) {
        return;
      }

      setStyle(this.viewBoxImage, assign({
        width: width,
        height: height
      }, getTransforms(assign({
        translateX: -left,
        translateY: -top
      }, imageData))));

      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);
        var originalWidth = data.width;
        var originalHeight = data.height;
        var newWidth = originalWidth;
        var newHeight = originalHeight;
        var ratio = 1;

        if (cropBoxWidth) {
          ratio = originalWidth / cropBoxWidth;
          newHeight = cropBoxHeight * ratio;
        }

        if (cropBoxHeight && newHeight > originalHeight) {
          ratio = originalHeight / cropBoxHeight;
          newWidth = cropBoxWidth * ratio;
          newHeight = originalHeight;
        }

        setStyle(element, {
          width: newWidth,
          height: newHeight
        });

        setStyle(element.getElementsByTagName('img')[0], assign({
          width: width * ratio,
          height: height * ratio
        }, getTransforms(assign({
          translateX: -left * ratio,
          translateY: -top * ratio
        }, imageData))));
      });
    }
  };

  var events = {
    bind: function bind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;


      if (isFunction(options.cropstart)) {
        addListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        addListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        addListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        addListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        addListener(element, EVENT_ZOOM, options.zoom);
      }

      addListener(cropper, EVENT_POINTER_DOWN, this.onCropStart = this.cropStart.bind(this));

      if (options.zoomable && options.zoomOnWheel) {
        addListener(cropper, EVENT_WHEEL, this.onWheel = this.wheel.bind(this));
      }

      if (options.toggleDragModeOnDblclick) {
        addListener(cropper, EVENT_DBLCLICK, this.onDblclick = this.dblclick.bind(this));
      }

      addListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove = this.cropMove.bind(this));
      addListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd = this.cropEnd.bind(this));

      if (options.responsive) {
        addListener(window, EVENT_RESIZE, this.onResize = this.resize.bind(this));
      }
    },
    unbind: function unbind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;


      if (isFunction(options.cropstart)) {
        removeListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        removeListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        removeListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        removeListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        removeListener(element, EVENT_ZOOM, options.zoom);
      }

      removeListener(cropper, EVENT_POINTER_DOWN, this.onCropStart);

      if (options.zoomable && options.zoomOnWheel) {
        removeListener(cropper, EVENT_WHEEL, this.onWheel);
      }

      if (options.toggleDragModeOnDblclick) {
        removeListener(cropper, EVENT_DBLCLICK, this.onDblclick);
      }

      removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove);
      removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd);

      if (options.responsive) {
        removeListener(window, EVENT_RESIZE, this.onResize);
      }
    }
  };

  var handlers = {
    resize: function resize() {
      var options = this.options,
          container = this.container,
          containerData = this.containerData;

      var minContainerWidth = Number(options.minContainerWidth) || 200;
      var minContainerHeight = Number(options.minContainerHeight) || 100;

      if (this.disabled || containerData.width <= minContainerWidth || containerData.height <= minContainerHeight) {
        return;
      }

      var ratio = container.offsetWidth / containerData.width;

      // Resize when width changed or height changed
      if (ratio !== 1 || container.offsetHeight !== containerData.height) {
        var canvasData = void 0;
        var cropBoxData = void 0;

        if (options.restore) {
          canvasData = this.getCanvasData();
          cropBoxData = this.getCropBoxData();
        }

        this.render();

        if (options.restore) {
          this.setCanvasData(forEach(canvasData, function (n, i) {
            canvasData[i] = n * ratio;
          }));
          this.setCropBoxData(forEach(cropBoxData, function (n, i) {
            cropBoxData[i] = n * ratio;
          }));
        }
      }
    },
    dblclick: function dblclick() {
      if (this.disabled || this.options.dragMode === DRAG_MODE_NONE) {
        return;
      }

      this.setDragMode(hasClass(this.dragBox, CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP);
    },
    wheel: function wheel(e) {
      var _this = this;

      var ratio = Number(this.options.wheelZoomRatio) || 0.1;
      var delta = 1;

      if (this.disabled) {
        return;
      }

      e.preventDefault();

      // Limit wheel speed to prevent zoom too fast (#21)
      if (this.wheeling) {
        return;
      }

      this.wheeling = true;

      setTimeout(function () {
        _this.wheeling = false;
      }, 50);

      if (e.deltaY) {
        delta = e.deltaY > 0 ? 1 : -1;
      } else if (e.wheelDelta) {
        delta = -e.wheelDelta / 120;
      } else if (e.detail) {
        delta = e.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, e);
    },
    cropStart: function cropStart(e) {
      if (this.disabled) {
        return;
      }

      var options = this.options,
          pointers = this.pointers;

      var action = void 0;

      if (e.changedTouches) {
        // Handle touch event
        forEach(e.changedTouches, function (touch) {
          pointers[touch.identifier] = getPointer(touch);
        });
      } else {
        // Handle mouse event and pointer event
        pointers[e.pointerId || 0] = getPointer(e);
      }

      if (Object.keys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
        action = ACTION_ZOOM;
      } else {
        action = getData(e.target, DATA_ACTION);
      }

      if (!REGEXP_ACTIONS.test(action)) {
        return;
      }

      if (dispatchEvent(this.element, EVENT_CROP_START, {
        originalEvent: e,
        action: action
      }) === false) {
        return;
      }

      // This line is required for preventing page zooming in iOS browsers
      e.preventDefault();

      this.action = action;
      this.cropping = false;

      if (action === ACTION_CROP) {
        this.cropping = true;
        addClass(this.dragBox, CLASS_MODAL);
      }
    },
    cropMove: function cropMove(e) {
      var action = this.action;


      if (this.disabled || !action) {
        return;
      }

      var pointers = this.pointers;


      e.preventDefault();

      if (dispatchEvent(this.element, EVENT_CROP_MOVE, {
        originalEvent: e,
        action: action
      }) === false) {
        return;
      }

      if (e.changedTouches) {
        forEach(e.changedTouches, function (touch) {
          assign(pointers[touch.identifier], getPointer(touch, true));
        });
      } else {
        assign(pointers[e.pointerId || 0], getPointer(e, true));
      }

      this.change(e);
    },
    cropEnd: function cropEnd(e) {
      if (this.disabled) {
        return;
      }

      var action = this.action,
          pointers = this.pointers;


      if (e.changedTouches) {
        forEach(e.changedTouches, function (touch) {
          delete pointers[touch.identifier];
        });
      } else {
        delete pointers[e.pointerId || 0];
      }

      if (!action) {
        return;
      }

      e.preventDefault();

      if (!Object.keys(pointers).length) {
        this.action = '';
      }

      if (this.cropping) {
        this.cropping = false;
        toggleClass(this.dragBox, CLASS_MODAL, this.cropped && this.options.modal);
      }

      dispatchEvent(this.element, EVENT_CROP_END, {
        originalEvent: e,
        action: action
      });
    }
  };

  var change = {
    change: function change(e) {
      var options = this.options,
          canvasData = this.canvasData,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData,
          pointers = this.pointers;
      var action = this.action;
      var aspectRatio = options.aspectRatio;
      var left = cropBoxData.left,
          top = cropBoxData.top,
          width = cropBoxData.width,
          height = cropBoxData.height;

      var right = left + width;
      var bottom = top + height;
      var minLeft = 0;
      var minTop = 0;
      var maxWidth = containerData.width;
      var maxHeight = containerData.height;
      var renderable = true;
      var offset = void 0;

      // Locking aspect ratio in "free mode" by holding shift key
      if (!aspectRatio && e.shiftKey) {
        aspectRatio = width && height ? width / height : 1;
      }

      if (this.limited) {
        minLeft = cropBoxData.minLeft;
        minTop = cropBoxData.minTop;

        maxWidth = minLeft + Math.min(containerData.width, canvasData.width, canvasData.left + canvasData.width);
        maxHeight = minTop + Math.min(containerData.height, canvasData.height, canvasData.top + canvasData.height);
      }

      var pointer = pointers[Object.keys(pointers)[0]];
      var range = {
        x: pointer.endX - pointer.startX,
        y: pointer.endY - pointer.startY
      };
      var check = function check(side) {
        switch (side) {
          case ACTION_EAST:
            if (right + range.x > maxWidth) {
              range.x = maxWidth - right;
            }

            break;

          case ACTION_WEST:
            if (left + range.x < minLeft) {
              range.x = minLeft - left;
            }

            break;

          case ACTION_NORTH:
            if (top + range.y < minTop) {
              range.y = minTop - top;
            }

            break;

          case ACTION_SOUTH:
            if (bottom + range.y > maxHeight) {
              range.y = maxHeight - bottom;
            }

            break;

          default:
        }
      };

      switch (action) {
        // Move crop box
        case ACTION_ALL:
          left += range.x;
          top += range.y;
          break;

        // Resize crop box
        case ACTION_EAST:
          if (range.x >= 0 && (right >= maxWidth || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_EAST);
          width += range.x;

          if (width < 0) {
            action = ACTION_WEST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_NORTH:
          if (range.y <= 0 && (top <= minTop || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_NORTH);
          height -= range.y;
          top += range.y;

          if (height < 0) {
            action = ACTION_SOUTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_WEST:
          if (range.x <= 0 && (left <= minLeft || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_WEST);
          width -= range.x;
          left += range.x;

          if (width < 0) {
            action = ACTION_EAST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_SOUTH:
          if (range.y >= 0 && (bottom >= maxHeight || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_SOUTH);
          height += range.y;

          if (height < 0) {
            action = ACTION_NORTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_NORTH_EAST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || right >= maxWidth)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
          } else {
            check(ACTION_NORTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_NORTH_WEST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || left <= minLeft)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
            left += cropBoxData.width - width;
          } else {
            check(ACTION_NORTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_WEST:
          if (aspectRatio) {
            if (range.x <= 0 && (left <= minLeft || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_WEST);
            width -= range.x;
            left += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_EAST:
          if (aspectRatio) {
            if (range.x >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_EAST);
            width += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            top -= height;
          }

          break;

        // Move canvas
        case ACTION_MOVE:
          this.move(range.x, range.y);
          renderable = false;
          break;

        // Zoom canvas
        case ACTION_ZOOM:
          this.zoom(getMaxZoomRatio(pointers), e);
          renderable = false;
          break;

        // Create crop box
        case ACTION_CROP:
          if (!range.x || !range.y) {
            renderable = false;
            break;
          }

          offset = getOffset(this.cropper);
          left = pointer.startX - offset.left;
          top = pointer.startY - offset.top;
          width = cropBoxData.minWidth;
          height = cropBoxData.minHeight;

          if (range.x > 0) {
            action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
          } else if (range.x < 0) {
            left -= width;
            action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
          }

          if (range.y < 0) {
            top -= height;
          }

          // Show the crop box if is hidden
          if (!this.cropped) {
            removeClass(this.cropBox, CLASS_HIDDEN);
            this.cropped = true;

            if (this.limited) {
              this.limitCropBox(true, true);
            }
          }

          break;

        default:
      }

      if (renderable) {
        cropBoxData.width = width;
        cropBoxData.height = height;
        cropBoxData.left = left;
        cropBoxData.top = top;
        this.action = action;
        this.renderCropBox();
      }

      // Override
      forEach(pointers, function (p) {
        p.startX = p.endX;
        p.startY = p.endY;
      });
    }
  };

  var methods = {
    // Show the crop box manually
    crop: function crop() {
      if (this.ready && !this.cropped && !this.disabled) {
        this.cropped = true;
        this.limitCropBox(true, true);

        if (this.options.modal) {
          addClass(this.dragBox, CLASS_MODAL);
        }

        removeClass(this.cropBox, CLASS_HIDDEN);
        this.setCropBoxData(this.initialCropBoxData);
      }

      return this;
    },


    // Reset the image and crop box to their initial states
    reset: function reset() {
      if (this.ready && !this.disabled) {
        this.imageData = assign({}, this.initialImageData);
        this.canvasData = assign({}, this.initialCanvasData);
        this.cropBoxData = assign({}, this.initialCropBoxData);
        this.renderCanvas();

        if (this.cropped) {
          this.renderCropBox();
        }
      }

      return this;
    },


    // Clear the crop box
    clear: function clear() {
      if (this.cropped && !this.disabled) {
        assign(this.cropBoxData, {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        });

        this.cropped = false;
        this.renderCropBox();
        this.limitCanvas(true, true);

        // Render canvas after crop box rendered
        this.renderCanvas();
        removeClass(this.dragBox, CLASS_MODAL);
        addClass(this.cropBox, CLASS_HIDDEN);
      }

      return this;
    },


    /**
     * Replace the image's src and rebuild the cropper
     * @param {string} url - The new URL.
     * @param {boolean} [hasSameSize] - Indicate if the new image has the same size as the old one.
     * @returns {Cropper} this
     */
    replace: function replace(url) {
      var hasSameSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!this.disabled && url) {
        if (this.isImg) {
          this.element.src = url;
        }

        if (hasSameSize) {
          this.url = url;
          this.image.src = url;

          if (this.ready) {
            this.viewBoxImage.src = url;

            forEach(this.previews, function (element) {
              element.getElementsByTagName('img')[0].src = url;
            });
          }
        } else {
          if (this.isImg) {
            this.replaced = true;
          }

          this.options.data = null;
          this.uncreate();
          this.load(url);
        }
      }

      return this;
    },


    // Enable (unfreeze) the cropper
    enable: function enable() {
      if (this.ready && this.disabled) {
        this.disabled = false;
        removeClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },


    // Disable (freeze) the cropper
    disable: function disable() {
      if (this.ready && !this.disabled) {
        this.disabled = true;
        addClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },


    /**
     * Destroy the cropper and remove the instance from the image
     * @returns {Cropper} this
     */
    destroy: function destroy() {
      var element = this.element;


      if (!getData(element, NAMESPACE)) {
        return this;
      }

      if (this.isImg && this.replaced) {
        element.src = this.originalUrl;
      }

      this.uncreate();
      removeData(element, NAMESPACE);

      return this;
    },


    /**
     * Move the canvas with relative offsets
     * @param {number} offsetX - The relative offset distance on the x-axis.
     * @param {number} [offsetY=offsetX] - The relative offset distance on the y-axis.
     * @returns {Cropper} this
     */
    move: function move(offsetX) {
      var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : offsetX;
      var _canvasData = this.canvasData,
          left = _canvasData.left,
          top = _canvasData.top;


      return this.moveTo(isUndefined(offsetX) ? offsetX : left + Number(offsetX), isUndefined(offsetY) ? offsetY : top + Number(offsetY));
    },


    /**
     * Move the canvas to an absolute point
     * @param {number} x - The x-axis coordinate.
     * @param {number} [y=x] - The y-axis coordinate.
     * @returns {Cropper} this
     */
    moveTo: function moveTo(x) {
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
      var canvasData = this.canvasData;

      var changed = false;

      x = Number(x);
      y = Number(y);

      if (this.ready && !this.disabled && this.options.movable) {
        if (isNumber(x)) {
          canvasData.left = x;
          changed = true;
        }

        if (isNumber(y)) {
          canvasData.top = y;
          changed = true;
        }

        if (changed) {
          this.renderCanvas(true);
        }
      }

      return this;
    },


    /**
     * Zoom the canvas with a relative ratio
     * @param {number} ratio - The target ratio.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoom: function zoom(ratio, _originalEvent) {
      var canvasData = this.canvasData;


      ratio = Number(ratio);

      if (ratio < 0) {
        ratio = 1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      return this.zoomTo(canvasData.width * ratio / canvasData.naturalWidth, null, _originalEvent);
    },


    /**
     * Zoom the canvas to an absolute ratio
     * @param {number} ratio - The target ratio.
     * @param {Object} pivot - The zoom pivot point coordinate.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoomTo: function zoomTo(ratio, pivot, _originalEvent) {
      var options = this.options,
          canvasData = this.canvasData;
      var width = canvasData.width,
          height = canvasData.height,
          naturalWidth = canvasData.naturalWidth,
          naturalHeight = canvasData.naturalHeight;


      ratio = Number(ratio);

      if (ratio >= 0 && this.ready && !this.disabled && options.zoomable) {
        var newWidth = naturalWidth * ratio;
        var newHeight = naturalHeight * ratio;

        if (dispatchEvent(this.element, EVENT_ZOOM, {
          ratio: ratio,
          oldRatio: width / naturalWidth,
          originalEvent: _originalEvent
        }) === false) {
          return this;
        }

        if (_originalEvent) {
          var pointers = this.pointers;

          var offset = getOffset(this.cropper);
          var center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
            pageX: _originalEvent.pageX,
            pageY: _originalEvent.pageY
          };

          // Zoom from the triggering point of the event
          canvasData.left -= (newWidth - width) * ((center.pageX - offset.left - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((center.pageY - offset.top - canvasData.top) / height);
        } else if (isPlainObject(pivot) && isNumber(pivot.x) && isNumber(pivot.y)) {
          canvasData.left -= (newWidth - width) * ((pivot.x - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((pivot.y - canvasData.top) / height);
        } else {
          // Zoom from the center of the canvas
          canvasData.left -= (newWidth - width) / 2;
          canvasData.top -= (newHeight - height) / 2;
        }

        canvasData.width = newWidth;
        canvasData.height = newHeight;
        this.renderCanvas(true);
      }

      return this;
    },


    /**
     * Rotate the canvas with a relative degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotate: function rotate(degree) {
      return this.rotateTo((this.imageData.rotate || 0) + Number(degree));
    },


    /**
     * Rotate the canvas to an absolute degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotateTo: function rotateTo(degree) {
      degree = Number(degree);

      if (isNumber(degree) && this.ready && !this.disabled && this.options.rotatable) {
        this.imageData.rotate = degree % 360;
        this.renderCanvas(true, true);
      }

      return this;
    },


    /**
     * Scale the image on the x-axis.
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @returns {Cropper} this
     */
    scaleX: function scaleX(_scaleX) {
      var scaleY = this.imageData.scaleY;


      return this.scale(_scaleX, isNumber(scaleY) ? scaleY : 1);
    },


    /**
     * Scale the image on the y-axis.
     * @param {number} scaleY - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scaleY: function scaleY(_scaleY) {
      var scaleX = this.imageData.scaleX;


      return this.scale(isNumber(scaleX) ? scaleX : 1, _scaleY);
    },


    /**
     * Scale the image
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scale: function scale(scaleX) {
      var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;
      var imageData = this.imageData;

      var transformed = false;

      scaleX = Number(scaleX);
      scaleY = Number(scaleY);

      if (this.ready && !this.disabled && this.options.scalable) {
        if (isNumber(scaleX)) {
          imageData.scaleX = scaleX;
          transformed = true;
        }

        if (isNumber(scaleY)) {
          imageData.scaleY = scaleY;
          transformed = true;
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }
      }

      return this;
    },


    /**
     * Get the cropped area position and size data (base on the original image)
     * @param {boolean} [rounded=false] - Indicate if round the data values or not.
     * @returns {Object} The result cropped data.
     */
    getData: function getData$$1() {
      var rounded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;

      var data = void 0;

      if (this.ready && this.cropped) {
        data = {
          x: cropBoxData.left - canvasData.left,
          y: cropBoxData.top - canvasData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };

        var ratio = imageData.width / imageData.naturalWidth;

        forEach(data, function (n, i) {
          data[i] = n / ratio;
        });

        if (rounded) {
          // In case rounding off leads to extra 1px in right or bottom border
          // we should round the top-left corner and the dimension (#343).
          var bottom = Math.round(data.y + data.height);
          var right = Math.round(data.x + data.width);

          data.x = Math.round(data.x);
          data.y = Math.round(data.y);
          data.width = right - data.x;
          data.height = bottom - data.y;
        }
      } else {
        data = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }

      if (options.rotatable) {
        data.rotate = imageData.rotate || 0;
      }

      if (options.scalable) {
        data.scaleX = imageData.scaleX || 1;
        data.scaleY = imageData.scaleY || 1;
      }

      return data;
    },


    /**
     * Set the cropped area position and size with new data
     * @param {Object} data - The new data.
     * @returns {Cropper} this
     */
    setData: function setData$$1(data) {
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData;

      var cropBoxData = {};

      if (this.ready && !this.disabled && isPlainObject(data)) {
        var transformed = false;

        if (options.rotatable) {
          if (isNumber(data.rotate) && data.rotate !== imageData.rotate) {
            imageData.rotate = data.rotate;
            transformed = true;
          }
        }

        if (options.scalable) {
          if (isNumber(data.scaleX) && data.scaleX !== imageData.scaleX) {
            imageData.scaleX = data.scaleX;
            transformed = true;
          }

          if (isNumber(data.scaleY) && data.scaleY !== imageData.scaleY) {
            imageData.scaleY = data.scaleY;
            transformed = true;
          }
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }

        var ratio = imageData.width / imageData.naturalWidth;

        if (isNumber(data.x)) {
          cropBoxData.left = data.x * ratio + canvasData.left;
        }

        if (isNumber(data.y)) {
          cropBoxData.top = data.y * ratio + canvasData.top;
        }

        if (isNumber(data.width)) {
          cropBoxData.width = data.width * ratio;
        }

        if (isNumber(data.height)) {
          cropBoxData.height = data.height * ratio;
        }

        this.setCropBoxData(cropBoxData);
      }

      return this;
    },


    /**
     * Get the container size data.
     * @returns {Object} The result container data.
     */
    getContainerData: function getContainerData() {
      return this.ready ? assign({}, this.containerData) : {};
    },


    /**
     * Get the image position and size data.
     * @returns {Object} The result image data.
     */
    getImageData: function getImageData() {
      return this.sized ? assign({}, this.imageData) : {};
    },


    /**
     * Get the canvas position and size data.
     * @returns {Object} The result canvas data.
     */
    getCanvasData: function getCanvasData() {
      var canvasData = this.canvasData;

      var data = {};

      if (this.ready) {
        forEach(['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'], function (n) {
          data[n] = canvasData[n];
        });
      }

      return data;
    },


    /**
     * Set the canvas position and size with new data.
     * @param {Object} data - The new canvas data.
     * @returns {Cropper} this
     */
    setCanvasData: function setCanvasData(data) {
      var canvasData = this.canvasData;
      var aspectRatio = canvasData.aspectRatio;


      if (this.ready && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          canvasData.left = data.left;
        }

        if (isNumber(data.top)) {
          canvasData.top = data.top;
        }

        if (isNumber(data.width)) {
          canvasData.width = data.width;
          canvasData.height = data.width / aspectRatio;
        } else if (isNumber(data.height)) {
          canvasData.height = data.height;
          canvasData.width = data.height * aspectRatio;
        }

        this.renderCanvas(true);
      }

      return this;
    },


    /**
     * Get the crop box position and size data.
     * @returns {Object} The result crop box data.
     */
    getCropBoxData: function getCropBoxData() {
      var cropBoxData = this.cropBoxData;

      var data = void 0;

      if (this.ready && this.cropped) {
        data = {
          left: cropBoxData.left,
          top: cropBoxData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };
      }

      return data || {};
    },


    /**
     * Set the crop box position and size with new data.
     * @param {Object} data - The new crop box data.
     * @returns {Cropper} this
     */
    setCropBoxData: function setCropBoxData(data) {
      var cropBoxData = this.cropBoxData;
      var aspectRatio = this.options.aspectRatio;

      var widthChanged = void 0;
      var heightChanged = void 0;

      if (this.ready && this.cropped && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          cropBoxData.left = data.left;
        }

        if (isNumber(data.top)) {
          cropBoxData.top = data.top;
        }

        if (isNumber(data.width) && data.width !== cropBoxData.width) {
          widthChanged = true;
          cropBoxData.width = data.width;
        }

        if (isNumber(data.height) && data.height !== cropBoxData.height) {
          heightChanged = true;
          cropBoxData.height = data.height;
        }

        if (aspectRatio) {
          if (widthChanged) {
            cropBoxData.height = cropBoxData.width / aspectRatio;
          } else if (heightChanged) {
            cropBoxData.width = cropBoxData.height * aspectRatio;
          }
        }

        this.renderCropBox();
      }

      return this;
    },


    /**
     * Get a canvas drawn the cropped image.
     * @param {Object} [options={}] - The config options.
     * @returns {HTMLCanvasElement} - The result canvas.
     */
    getCroppedCanvas: function getCroppedCanvas() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.ready || !window.HTMLCanvasElement) {
        return null;
      }

      var canvasData = this.canvasData;

      var source = getSourceCanvas(this.image, this.imageData, canvasData, options);

      // Returns the source canvas if it is not cropped.
      if (!this.cropped) {
        return source;
      }

      var _getData = this.getData(),
          initialX = _getData.x,
          initialY = _getData.y,
          initialWidth = _getData.width,
          initialHeight = _getData.height;

      var ratio = source.width / Math.floor(canvasData.naturalWidth);

      if (ratio !== 1) {
        initialX *= ratio;
        initialY *= ratio;
        initialWidth *= ratio;
        initialHeight *= ratio;
      }

      var aspectRatio = initialWidth / initialHeight;
      var maxSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.maxWidth || Infinity,
        height: options.maxHeight || Infinity
      });
      var minSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.minWidth || 0,
        height: options.minHeight || 0
      }, 'cover');

      var _getAdjustedSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.width || (ratio !== 1 ? source.width : initialWidth),
        height: options.height || (ratio !== 1 ? source.height : initialHeight)
      }),
          width = _getAdjustedSizes.width,
          height = _getAdjustedSizes.height;

      width = Math.min(maxSizes.width, Math.max(minSizes.width, width));
      height = Math.min(maxSizes.height, Math.max(minSizes.height, height));

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      canvas.width = normalizeDecimalNumber(width);
      canvas.height = normalizeDecimalNumber(height);

      context.fillStyle = options.fillColor || 'transparent';
      context.fillRect(0, 0, width, height);

      var _options$imageSmoothi = options.imageSmoothingEnabled,
          imageSmoothingEnabled = _options$imageSmoothi === undefined ? true : _options$imageSmoothi,
          imageSmoothingQuality = options.imageSmoothingQuality;


      context.imageSmoothingEnabled = imageSmoothingEnabled;

      if (imageSmoothingQuality) {
        context.imageSmoothingQuality = imageSmoothingQuality;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage
      var sourceWidth = source.width;
      var sourceHeight = source.height;

      // Source canvas parameters
      var srcX = initialX;
      var srcY = initialY;
      var srcWidth = void 0;
      var srcHeight = void 0;

      // Destination canvas parameters
      var dstX = void 0;
      var dstY = void 0;
      var dstWidth = void 0;
      var dstHeight = void 0;

      if (srcX <= -initialWidth || srcX > sourceWidth) {
        srcX = 0;
        srcWidth = 0;
        dstX = 0;
        dstWidth = 0;
      } else if (srcX <= 0) {
        dstX = -srcX;
        srcX = 0;
        srcWidth = Math.min(sourceWidth, initialWidth + srcX);
        dstWidth = srcWidth;
      } else if (srcX <= sourceWidth) {
        dstX = 0;
        srcWidth = Math.min(initialWidth, sourceWidth - srcX);
        dstWidth = srcWidth;
      }

      if (srcWidth <= 0 || srcY <= -initialHeight || srcY > sourceHeight) {
        srcY = 0;
        srcHeight = 0;
        dstY = 0;
        dstHeight = 0;
      } else if (srcY <= 0) {
        dstY = -srcY;
        srcY = 0;
        srcHeight = Math.min(sourceHeight, initialHeight + srcY);
        dstHeight = srcHeight;
      } else if (srcY <= sourceHeight) {
        dstY = 0;
        srcHeight = Math.min(initialHeight, sourceHeight - srcY);
        dstHeight = srcHeight;
      }

      var params = [srcX, srcY, srcWidth, srcHeight];

      // Avoid "IndexSizeError"
      if (dstWidth > 0 && dstHeight > 0) {
        var scale = width / initialWidth;

        params.push(dstX * scale, dstY * scale, dstWidth * scale, dstHeight * scale);
      }

      // All the numerical parameters should be integer for `drawImage`
      // https://github.com/fengyuanchen/cropper/issues/476
      context.drawImage.apply(context, [source].concat(toConsumableArray(params.map(function (param) {
        return Math.floor(normalizeDecimalNumber(param));
      }))));

      return canvas;
    },


    /**
     * Change the aspect ratio of the crop box.
     * @param {number} aspectRatio - The new aspect ratio.
     * @returns {Cropper} this
     */
    setAspectRatio: function setAspectRatio(aspectRatio) {
      var options = this.options;


      if (!this.disabled && !isUndefined(aspectRatio)) {
        // 0 -> NaN
        options.aspectRatio = Math.max(0, aspectRatio) || NaN;

        if (this.ready) {
          this.initCropBox();

          if (this.cropped) {
            this.renderCropBox();
          }
        }
      }

      return this;
    },


    /**
     * Change the drag mode.
     * @param {string} mode - The new drag mode.
     * @returns {Cropper} this
     */
    setDragMode: function setDragMode(mode) {
      var options = this.options,
          dragBox = this.dragBox,
          face = this.face;


      if (this.ready && !this.disabled) {
        var croppable = mode === DRAG_MODE_CROP;
        var movable = options.movable && mode === DRAG_MODE_MOVE;

        mode = croppable || movable ? mode : DRAG_MODE_NONE;

        options.dragMode = mode;
        setData(dragBox, DATA_ACTION, mode);
        toggleClass(dragBox, CLASS_CROP, croppable);
        toggleClass(dragBox, CLASS_MOVE, movable);

        if (!options.cropBoxMovable) {
          // Sync drag mode to crop box when it is not movable
          setData(face, DATA_ACTION, mode);
          toggleClass(face, CLASS_CROP, croppable);
          toggleClass(face, CLASS_MOVE, movable);
        }
      }

      return this;
    }
  };

  var AnotherCropper = WINDOW.Cropper;

  var Cropper = function () {
    /**
     * Create a new Cropper.
     * @param {Element} element - The target element for cropping.
     * @param {Object} [options={}] - The configuration options.
     */
    function Cropper(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, Cropper);

      if (!element || !REGEXP_TAG_NAME.test(element.tagName)) {
        throw new Error('The first argument is required and must be an <img> or <canvas> element.');
      }

      this.element = element;
      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.cropped = false;
      this.disabled = false;
      this.pointers = {};
      this.ready = false;
      this.reloading = false;
      this.replaced = false;
      this.sized = false;
      this.sizing = false;
      this.init();
    }

    createClass(Cropper, [{
      key: 'init',
      value: function init() {
        var element = this.element;

        var tagName = element.tagName.toLowerCase();
        var url = void 0;

        if (getData(element, NAMESPACE)) {
          return;
        }

        setData(element, NAMESPACE, this);

        if (tagName === 'img') {
          this.isImg = true;

          // e.g.: "img/picture.jpg"
          url = element.getAttribute('src') || '';
          this.originalUrl = url;

          // Stop when it's a blank image
          if (!url) {
            return;
          }

          // e.g.: "http://example.com/img/picture.jpg"
          url = element.src;
        } else if (tagName === 'canvas' && window.HTMLCanvasElement) {
          url = element.toDataURL();
        }

        this.load(url);
      }
    }, {
      key: 'load',
      value: function load(url) {
        var _this = this;

        if (!url) {
          return;
        }

        this.url = url;
        this.imageData = {};

        var element = this.element,
            options = this.options;


        if (!options.rotatable && !options.scalable) {
          options.checkOrientation = false;
        }

        if (!options.checkOrientation || !window.ArrayBuffer) {
          this.clone();
          return;
        }

        // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari
        if (REGEXP_DATA_URL.test(url)) {
          if (REGEXP_DATA_URL_JPEG.test(url)) {
            this.read(dataURLToArrayBuffer(url));
          } else {
            this.clone();
          }

          return;
        }

        var xhr = new XMLHttpRequest();

        this.reloading = true;
        this.xhr = xhr;

        var done = function done() {
          _this.reloading = false;
          _this.xhr = null;
        };

        xhr.ontimeout = done;
        xhr.onabort = done;
        xhr.onerror = function () {
          done();
          _this.clone();
        };

        xhr.onload = function () {
          done();
          _this.read(xhr.response);
        };

        // Bust cache when there is a "crossOrigin" property
        if (options.checkCrossOrigin && isCrossOriginURL(url) && element.crossOrigin) {
          url = addTimestamp(url);
        }

        xhr.open('get', url);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = element.crossOrigin === 'use-credentials';
        xhr.send();
      }
    }, {
      key: 'read',
      value: function read(arrayBuffer) {
        var options = this.options,
            imageData = this.imageData;

        var orientation = getOrientation(arrayBuffer);
        var rotate = 0;
        var scaleX = 1;
        var scaleY = 1;

        if (orientation > 1) {
          this.url = arrayBufferToDataURL(arrayBuffer, 'image/jpeg');

          var _parseOrientation = parseOrientation(orientation);

          rotate = _parseOrientation.rotate;
          scaleX = _parseOrientation.scaleX;
          scaleY = _parseOrientation.scaleY;
        }

        if (options.rotatable) {
          imageData.rotate = rotate;
        }

        if (options.scalable) {
          imageData.scaleX = scaleX;
          imageData.scaleY = scaleY;
        }

        this.clone();
      }
    }, {
      key: 'clone',
      value: function clone() {
        var element = this.element,
            url = this.url;

        var crossOrigin = void 0;
        var crossOriginUrl = void 0;

        if (this.options.checkCrossOrigin && isCrossOriginURL(url)) {
          crossOrigin = element.crossOrigin;


          if (crossOrigin) {
            crossOriginUrl = url;
          } else {
            crossOrigin = 'anonymous';

            // Bust cache when there is not a "crossOrigin" property
            crossOriginUrl = addTimestamp(url);
          }
        }

        this.crossOrigin = crossOrigin;
        this.crossOriginUrl = crossOriginUrl;

        var image = document.createElement('img');

        if (crossOrigin) {
          image.crossOrigin = crossOrigin;
        }

        image.src = crossOriginUrl || url;
        this.image = image;
        image.onload = this.start.bind(this);
        image.onerror = this.stop.bind(this);
        addClass(image, CLASS_HIDE);
        element.parentNode.insertBefore(image, element.nextSibling);
      }
    }, {
      key: 'start',
      value: function start() {
        var _this2 = this;

        var image = this.isImg ? this.element : this.image;

        image.onload = null;
        image.onerror = null;
        this.sizing = true;

        var IS_SAFARI = WINDOW.navigator && /(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i.test(WINDOW.navigator.userAgent);
        var done = function done(naturalWidth, naturalHeight) {
          assign(_this2.imageData, {
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            aspectRatio: naturalWidth / naturalHeight
          });
          _this2.sizing = false;
          _this2.sized = true;
          _this2.build();
        };

        // Modern browsers (except Safari)
        if (image.naturalWidth && !IS_SAFARI) {
          done(image.naturalWidth, image.naturalHeight);
          return;
        }

        var sizingImage = document.createElement('img');
        var body = document.body || document.documentElement;

        this.sizingImage = sizingImage;

        sizingImage.onload = function () {
          done(sizingImage.width, sizingImage.height);

          if (!IS_SAFARI) {
            body.removeChild(sizingImage);
          }
        };

        sizingImage.src = image.src;

        // iOS Safari will convert the image automatically
        // with its orientation once append it into DOM (#279)
        if (!IS_SAFARI) {
          sizingImage.style.cssText = 'left:0;' + 'max-height:none!important;' + 'max-width:none!important;' + 'min-height:0!important;' + 'min-width:0!important;' + 'opacity:0;' + 'position:absolute;' + 'top:0;' + 'z-index:-1;';
          body.appendChild(sizingImage);
        }
      }
    }, {
      key: 'stop',
      value: function stop() {
        var image = this.image;


        image.onload = null;
        image.onerror = null;
        image.parentNode.removeChild(image);
        this.image = null;
      }
    }, {
      key: 'build',
      value: function build() {
        if (!this.sized || this.ready) {
          return;
        }

        var element = this.element,
            options = this.options,
            image = this.image;

        // Create cropper elements

        var container = element.parentNode;
        var template = document.createElement('div');

        template.innerHTML = TEMPLATE;

        var cropper = template.querySelector('.' + NAMESPACE + '-container');
        var canvas = cropper.querySelector('.' + NAMESPACE + '-canvas');
        var dragBox = cropper.querySelector('.' + NAMESPACE + '-drag-box');
        var cropBox = cropper.querySelector('.' + NAMESPACE + '-crop-box');
        var face = cropBox.querySelector('.' + NAMESPACE + '-face');

        this.container = container;
        this.cropper = cropper;
        this.canvas = canvas;
        this.dragBox = dragBox;
        this.cropBox = cropBox;
        this.viewBox = cropper.querySelector('.' + NAMESPACE + '-view-box');
        this.face = face;

        canvas.appendChild(image);

        // Hide the original image
        addClass(element, CLASS_HIDDEN);

        // Inserts the cropper after to the current image
        container.insertBefore(cropper, element.nextSibling);

        // Show the image if is hidden
        if (!this.isImg) {
          removeClass(image, CLASS_HIDE);
        }

        this.initPreview();
        this.bind();

        options.initialAspectRatio = Math.max(0, options.initialAspectRatio) || NaN;
        options.aspectRatio = Math.max(0, options.aspectRatio) || NaN;
        options.viewMode = Math.max(0, Math.min(3, Math.round(options.viewMode))) || 0;

        addClass(cropBox, CLASS_HIDDEN);

        if (!options.guides) {
          addClass(cropBox.getElementsByClassName(NAMESPACE + '-dashed'), CLASS_HIDDEN);
        }

        if (!options.center) {
          addClass(cropBox.getElementsByClassName(NAMESPACE + '-center'), CLASS_HIDDEN);
        }

        if (options.background) {
          addClass(cropper, NAMESPACE + '-bg');
        }

        if (!options.highlight) {
          addClass(face, CLASS_INVISIBLE);
        }

        if (options.cropBoxMovable) {
          addClass(face, CLASS_MOVE);
          setData(face, DATA_ACTION, ACTION_ALL);
        }

        if (!options.cropBoxResizable) {
          addClass(cropBox.getElementsByClassName(NAMESPACE + '-line'), CLASS_HIDDEN);
          addClass(cropBox.getElementsByClassName(NAMESPACE + '-point'), CLASS_HIDDEN);
        }

        this.render();
        this.ready = true;
        this.setDragMode(options.dragMode);

        if (options.autoCrop) {
          this.crop();
        }

        this.setData(options.data);

        if (isFunction(options.ready)) {
          addListener(element, EVENT_READY, options.ready, {
            once: true
          });
        }

        dispatchEvent(element, EVENT_READY);
      }
    }, {
      key: 'unbuild',
      value: function unbuild() {
        if (!this.ready) {
          return;
        }

        this.ready = false;
        this.unbind();
        this.resetPreview();
        this.cropper.parentNode.removeChild(this.cropper);
        removeClass(this.element, CLASS_HIDDEN);
      }
    }, {
      key: 'uncreate',
      value: function uncreate() {
        if (this.ready) {
          this.unbuild();
          this.ready = false;
          this.cropped = false;
        } else if (this.sizing) {
          this.sizingImage.onload = null;
          this.sizing = false;
          this.sized = false;
        } else if (this.reloading) {
          this.xhr.abort();
        } else if (this.image) {
          this.stop();
        }
      }

      /**
       * Get the no conflict cropper class.
       * @returns {Cropper} The cropper class.
       */

    }], [{
      key: 'noConflict',
      value: function noConflict() {
        window.Cropper = AnotherCropper;
        return Cropper;
      }

      /**
       * Change the default options.
       * @param {Object} options - The new default options.
       */

    }, {
      key: 'setDefaults',
      value: function setDefaults(options) {
        assign(DEFAULTS, isPlainObject(options) && options);
      }
    }]);
    return Cropper;
  }();

  assign(Cropper.prototype, render, preview, events, handlers, change, methods);

  return Cropper;

})));

function wspShowInfo(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'info'
    });
}

function wspShowError(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'error'
    });

}

function wspShowSuccess(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'success'
    });
}


function wspShowSuccessBottomRight(title, message)
{
    new PNotify({
        title: title,
        text: message,
        type: 'info',
        push: 'top',
        addclass: "stack-bottomright",
    })
}

(function($){

    //edit slider
    $.post(ajaxurl, {
        action: 'woo_slider_pro_get_affiliates_offers'

    }, function(response){
        console.log(response);
        let data = JSON.parse(JSON.parse(response));
        let pickedItem = _.sample(data);


        let currentURL = window.location.href;
        console.log(currentURL);

        if (currentURL.indexOf('woo-slider-pro')!== -1)
            wspShowSuccessBottomRight('Caution!', '<a target="_blank" href="'+pickedItem.url+'">'+pickedItem.title+'</a>');

    });



})(jQuery);
//# sourceMappingURL=backend-bundle.js.map