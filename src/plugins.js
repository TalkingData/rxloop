// plugins
export default function init(plugins) {
  plugins.forEach(plugin => plugin.call(this));
};
