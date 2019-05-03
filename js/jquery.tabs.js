/**
 * jqtabs javascript
 *
 * @author liangshishen
 */

(function ($) {

	function wrapTabs(container) {
		$(container).addClass('jqtabs-container');
		$('<div class="jqtabs-header">'
			+ '<div class="jqtabs-scroller-left">&laquo;</div>'
			+ '<div class="jqtabs-wrap">'
			+ '  <ul class="jqtabs"></ul>'
			+ '</div>'
			+ '<div class="jqtabs-scroller-right">&raquo;</div>'
			+ '<div class="jqtabs-dropdown">'
			+ '  <div class="jqtabs-dropdown-menu">'
			+ '    <a href="javascript:;" class="jqtabs-refresh">刷新当前</a>'
			+ '    <a href="javascript:;" class="jqtabs-close-other">关闭其他</a>'
			+ '    <a href="javascript:;" class="jqtabs-close-all">关闭全部</a>'
			+ '  </div>'
			+ '</div>'
			+ '</div>').prependTo(container);
	}

	function bindEvents(container) {
		var state = $.data(container, 'jqtabs');
		var opts = state.options;
		$(container).children('div.jqtabs-header').unbind().bind('click', function (e) {
			//左滚动
			if ($(e.target).hasClass('jqtabs-scroller-left')) {
				$(container).jqtabs('scrollBy', -opts.scrollIncrement);
			}
			//右滚动
			else if ($(e.target).hasClass('jqtabs-scroller-right')) {
				$(container).jqtabs('scrollBy', opts.scrollIncrement);
			}
			//刷新当前
			else if ($(e.target).hasClass('jqtabs-refresh')) {
				refreshTab(container);
			}
			//关闭其他
			else if ($(e.target).hasClass('jqtabs-close-other')) {
				closeOtherTabs(container);
			}
			//关闭全部
			else if ($(e.target).hasClass('jqtabs-close-all')) {
				closeAllTabs(container);
			}
			//关闭某个
			else if ($(e.target).hasClass('jqtabs-close')) {
				closeTab(container, $(e.target).closest('li'));
			}
			//选中选项卡
			else if ($(e.target).is('li') || $(e.target).is('span')) {
				var li = $(e.target);
				li.is('span') && (li = li.closest('li'));
				selectTab(container, li);
			}
		});
	}

	function getSelectedTab(container) {
		return $(container).find("li.jqtabs-selected");
	}

	function refreshTab(container) {
		var state = $.data(container, 'jqtabs');
		var opts = state.options;

		var selectedTab = getSelectedTab(container);
		if (selectedTab.length <= 0) return;
		//回调函数
		var index = selectedTab.data('tabOptions').index;
		opts.onRefresh.call(container, selectedTab, index);
	}

	function closeOtherTabs(container) {
		var state = $.data(container, 'jqtabs');
		var opts = state.options;

		var selectedTab = getSelectedTab(container);
		selectedTab.siblings().each(function () {
			var $this = $(this),
				tabOptions = $this.data('tabOptions');
			if (tabOptions.closeable !== false) {
				//回调函数
				opts.onClose.call(container, $this, tabOptions.index);
				$this.remove();
			}
		});

		$(container).jqtabs('scrollBy', 0);
	}

	function closeAllTabs(container) {
		var state = $.data(container, 'jqtabs');
		var opts = state.options;

		var tabs = $(container).children('div.jqtabs-header').find('ul.jqtabs>li');
		tabs.each(function () {
			var $this = $(this),
				tabOptions = $this.data('tabOptions');
			if (tabOptions.closeable !== false) {
				//回调函数
				opts.onClose.call(container, $this, tabOptions.index);
				$this.remove();
			}
		});

		tabs = tabs.parent().children().not('.jqtabs-selected');
		if (tabs.length > 0) {
			//默认剩下的第一个选中
			var tab = tabs.eq(0);
			tab.addClass("jqtabs-selected");
			//回调函数
			var index = tab.data('tabOptions').index;
			opts.onSelect.call(container, tab, index);
		}

		$(container).jqtabs('scrollBy', 0);
	}

	function closeTab(container, tab) {
		var state = $.data(container, 'jqtabs');
		var opts = state.options;
		//回调函数，返回false则阻止关闭操作
		if (opts.onBeforeClose.call(container, tab) === false) return;
		//删除选项卡
		var $active = tab;
		if (tab.hasClass("jqtabs-selected")) {
			if (($active = tab.prev()).length > 0) {
				$active.addClass("jqtabs-selected");
				//回调函数
				var index = $active.data('tabOptions').index;
				opts.onSelect.call(container, $active, index);
			} else if (($active = tab.next()).length > 0) {
				$active.addClass("jqtabs-selected");
				//回调函数
				var index = $active.data('tabOptions').index;
				opts.onSelect.call(container, $active, index);
			}
		}
		scrollToTab(container, $active);
		//回调函数
		var index = tab.data('tabOptions').index;
		opts.onClose.call(container, tab, index);
		tab.remove();
	}

	function selectTab(container, tab) {
		if (tab.hasClass('jqtabs-selected')) return;

		var state = $.data(container, 'jqtabs');
		var opts = state.options;

		tab.addClass("jqtabs-selected").siblings().removeClass("jqtabs-selected");

		scrollToTab(container, tab);

		//回调函数
		var index = $(tab).data('tabOptions').index;
		opts.onSelect.call(container, tab, index);
	}

	function addTab(container, options) {
		options = options || {};
		var state = $.data(container, 'jqtabs');
		var opts = state.options;

		if (opts.countIndex === undefined || opts.countIndex < 0) {
			opts.countIndex = 0;
		}

		options.index = opts.countIndex++;

		var ul = $(container).children('div.jqtabs-header').find('ul.jqtabs');
		var tab = $('<li></li>');
		tab.data('tabOptions', options).appendTo(ul);

		//添加标题
		$('<span></span>').html(options.title).appendTo(tab);
		//可否关闭
		if (options.closeable !== false) {
			tab.append('<i class="jqtabs-close">x</i>');
		}
		//是否选中
		if (options.selected !== false) {
			tab.addClass("jqtabs-selected").siblings().removeClass("jqtabs-selected");
		}

		//回调函数
		opts.onAdd.call(container, tab, options.index);

		scrollToTab(container, tab);
	}

	function scrollToTab(container, tab) {
		if (tab.length <= 0) return;
		// scroll the tab to center position if required.
		var wrap = $(container).find('>div.jqtabs-header>div.jqtabs-wrap');
		var left = tab.position().left;
		var right = left + tab.outerWidth();
		var deltaX = 0;
		if (left < 0 || right > wrap.width()) {
			deltaX = left - (wrap.width() - tab.width()) / 2;
		}
		$(container).jqtabs('scrollBy', deltaX);
	}

	$.fn.jqtabs = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.jqtabs.methods[options](this, param);
		}

		options = options || {};
		return this.each(function () {
			var state = $.data(this, 'jqtabs');
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, 'jqtabs', {
					options: $.extend({}, $.fn.jqtabs.defaults, options)
				});
				wrapTabs(this);
			}

			bindEvents(this);
		});
	};

	$.fn.jqtabs.methods = {
		add: function (jq, options) {
			return jq.each(function () {
				addTab(this, options);
			});
		},
		scrollBy: function (jq, deltaX) {
			return jq.each(function () {
				var opts = $(this).data('jqtabs').options;
				var wrap = $(this).find('>div.jqtabs-header>div.jqtabs-wrap');
				var pos = Math.min(wrap.scrollLeft() + deltaX, getMaxScrollWidth());
				wrap.animate({scrollLeft: pos}, opts.scrollDuration);

				function getMaxScrollWidth() {
					var w = 0;
					var ul = wrap.children('ul');
					ul.children('li').each(function () {
						w += $(this).outerWidth(true);
					});
					return w - wrap.width() + (ul.outerWidth() - ul.width());
				}
			});
		}
	};

	$.fn.jqtabs.defaults = {
		scrollIncrement: 200,
		scrollDuration: "fast",
		onAdd: function (tab, index) {},
		onSelect: function (tab, index) {},
		onRefresh: function (tab, index) {},
		onBeforeClose: function (tab, index) {},
		onClose: function (tab, index) {}
	};

})(jQuery);