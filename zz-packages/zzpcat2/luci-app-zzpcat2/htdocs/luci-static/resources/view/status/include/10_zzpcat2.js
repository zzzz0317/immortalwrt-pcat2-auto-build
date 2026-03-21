'use strict';
'require baseclass';
'require rpc';

var callPowerInfo = rpc.declare({
	object: 'luci.zzpcat2',
	method: 'get_power_info',
	expect: { '': {} }
});

function progressbar(value, max, min, unit) {
	var val = parseFloat(value) || 0,
		maximum = parseFloat(max) || 100,
		minimum = parseFloat(min) || 0,
		u = unit || '',
		pc = Math.floor((100 / (maximum - minimum)) * (val - minimum));

	return E('div', {
		'class': 'cbi-progressbar',
		'title': '%s / %s%s (%d%%)'.format(val, maximum, u, pc)
	}, E('div', { 'style': 'width:%.2f%%'.format(pc) }));
}

return baseclass.extend({
	title: _('Power Information'),

	load: function() {
		return Promise.all([
			callPowerInfo()
		]);
	},

	render: function(data) {
		var info = data[0] || {};
		
		var table = E('table', { 'class': 'table' });

		var addRow = function(label, value) {
			table.appendChild(E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td left', 'width': '33%' }, [ _(label) ]),
				E('td', { 'class': 'td left' }, [ value ])
			]));
		};

		if (info.bat_capacity && info.bat_capacity !== 'null') {
			addRow('Battery Capacity', progressbar(info.bat_capacity, 100, 0, '%'));
		}
		
		if (info.bat_voltage && info.bat_voltage !== 'null') {
			var bat_v = (parseFloat(info.bat_voltage) / 1000000).toFixed(3);
			var bat_v_max = info.bat_voltage_max && info.bat_voltage_max !== 'null' ? (parseFloat(info.bat_voltage_max) / 1000000).toFixed(3) : 8.40;
			var bat_v_min = info.bat_voltage_min && info.bat_voltage_min !== 'null' ? (parseFloat(info.bat_voltage_min) / 1000000).toFixed(3) : 6.80;
			addRow('Battery Voltage', progressbar(bat_v, bat_v_max, bat_v_min, ' V'));
		}

		if (info.bat_current && info.bat_current !== 'null') {
			addRow('Battery Current', (parseFloat(info.bat_current) / 1000000).toFixed(3) + ' A');
		}

		if (info.bat_power && info.bat_power !== 'null') {
			addRow('Battery Power', (parseFloat(info.bat_power) / 1000000).toFixed(3) + ' W');
		}

		if (info.chg_voltage && info.chg_voltage !== 'null') {
			addRow('Charger Voltage', (parseFloat(info.chg_voltage) / 1000000).toFixed(3) + ' V');
		}

		if (info.chg_online && info.chg_online !== 'null') {
			addRow('Charger State', info.chg_online === '1' ? _('Connected') : _('Disconnected'));
		}

		if (info.fan_cur_state && info.fan_cur_state !== 'null') {
			var fan_max = info.fan_max_state && info.fan_max_state !== 'null' ? info.fan_max_state : '-';
			addRow('Fan State', info.fan_cur_state + ' / ' + fan_max);
		}

		if (info.fan_rpm && info.fan_rpm !== 'null') {
			addRow('Fan RPM', info.fan_rpm + ' RPM');
		}

		if (info.mb_temp && info.mb_temp !== 'null') {
			addRow('Motherboard Temp', (parseFloat(info.mb_temp) / 1000).toFixed(2) + ' °C');
		}

		if (info.backlight && info.backlight !== 'null') {
			addRow('Backlight', info.backlight);
		}

		if (table.childNodes.length === 0) {
			table.appendChild(E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td left', 'width': '100%' }, [ _('No power information available') ])
			]));
		}

		var thermalTable = E('table', { 'class': 'table' }, [
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th', 'width': '33%' }, _('Name')),
				E('th', { 'class': 'th' }, _('Temp')),
				// E('th', { 'class': 'th' }, _('Passive')),
				// E('th', { 'class': 'th' }, _('Critical'))
			])
		]);

		if (info.thermal_zones && Array.isArray(info.thermal_zones)) {
			info.thermal_zones.forEach(function(zone) {
				var temp = zone.temp && zone.temp !== 'null' ? (parseFloat(zone.temp) / 1000).toFixed(3) + ' °C' : '-';
				var passive = '-', critical = '-';
				
				var checkTrip = function(type, t) {
					if (t && t !== 'null') return (parseFloat(t) / 1000).toFixed(3) + ' °C';
					return '-';
				};

				if (zone.trip_point_0_type === 'passive') passive = checkTrip('passive', zone.trip_point_0_temp);
				if (zone.trip_point_0_type === 'critical') critical = checkTrip('critical', zone.trip_point_0_temp);
				if (zone.trip_point_1_type === 'passive') passive = checkTrip('passive', zone.trip_point_1_temp);
				if (zone.trip_point_1_type === 'critical') critical = checkTrip('critical', zone.trip_point_1_temp);

				thermalTable.appendChild(E('tr', { 'class': 'tr' }, [
					E('td', { 'class': 'td' }, zone.name),
					E('td', { 'class': 'td' }, temp),
					// E('td', { 'class': 'td' }, passive),
					// E('td', { 'class': 'td' }, critical)
				]));
			});
		}

		return E('div', {}, [
			table,
			E('h3', {}, _('Thermal Zones')),
			thermalTable
		]);
	}
});
