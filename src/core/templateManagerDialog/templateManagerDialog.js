angular.module('classeur.core.templateManagerDialog', [])
	.factory('clTemplateManagerDialog', function($window, clDialog, clSettingSvc) {
		return function(templates) {
			templates = clSettingSvc.sanitizeExportTemplates(templates);
			return clDialog.show({
				templateUrl: 'core/templateManagerDialog/templateManagerDialog.html',
				onComplete: function(scope, element) {
					scope.templates = templates;
					var preElt = element[0].querySelector('pre');
					var cledit = $window.cledit(preElt);
					cledit.init({
						highlighter: function(text) {
							return $window.Prism.highlight(text, $window.Prism.languages.markup);
						}
					});
					var lastSelectedKey;
					scope.$watch('selectedKey', function(selectedKey) {
						scope.canBeRemoved = selectedKey && !clSettingSvc.defaultValues.exportTemplates.hasOwnProperty(selectedKey);
						if (lastSelectedKey !== selectedKey) {
							lastSelectedKey = selectedKey;
							scope.templateKey = selectedKey;
							cledit.setContent(templates[selectedKey] || '');
						}
					});
					scope.$watch('templateKey', function(templateKey) {
						if (lastSelectedKey !== templateKey) {
							scope.selectedKey = templates.hasOwnProperty(templateKey) ? templateKey : undefined;
							lastSelectedKey = scope.selectedKey;
						}
					});
					scope.remove = function() {
						delete templates[scope.templateKey];
						scope.templateKey = undefined;
						scope.selectedKey = undefined;
						cledit.setContent('');
					};
					scope.addOrReplace = function() {
						var templateValue = cledit.getContent();
						if(!scope.templateKey || !templateValue) {
							return;
						}
						templates[scope.templateKey] = templateValue;
						scope.selectedKey = scope.templateKey;
					};
					scope.ok = function() {
						scope.addOrReplace();
						clDialog.hide(clSettingSvc.sanitizeExportTemplates(templates));
					};
					scope.cancel = function() {
						clDialog.cancel();
					};
				}
			});
		};
	});