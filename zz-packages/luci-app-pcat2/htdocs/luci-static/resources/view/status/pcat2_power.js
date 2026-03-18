'use strict';
'require form';
'require fs';
'require ui';
'require uci';
'require view';

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(call('luci.pcat2', 'get_all'), {})
		]);
	},

	render: function(data) {
		const powerInfo = data[0] || {};

		// 格式化函数
		const formatVoltage = (uv) => (uv / 1000000).toFixed(2) + ' V';
		const formatCurrent = (ua) => (ua / 1000000).toFixed(3) + ' A';
		const formatPower = (uw) => (uw / 1000000).toFixed(3) + ' W';
		const formatTemp = (mc) => (mc / 1000).toFixed(1) + ' °C';
		const formatRPM = (rpm) => rpm + ' RPM';

		// 电池状态颜色
		const getBatteryColor = (capacity) => {
			if (capacity > 50) return '#28a745';
			if (capacity > 20) return '#ffc107';
			return '#dc3545';
		};

		// 充电状态
		const getChargingStatus = (online) => {
			return online == 1 ? '充电中' : '未充电';
		};

		// 风扇状态
		const getFanStatus = (cur, max) => {
			return `${cur} / ${max} 档`;
		};

		let html = '';

		// 样式
		html += `
<style>
	.pcat2-power-section {
		margin-bottom: 20px;
	}
	.pcat2-power-table {
		width: 100%;
		border-collapse: collapse;
	}
	.pcat2-power-table td {
		padding: 8px 12px;
		border-bottom: 1px solid #e9ecef;
	}
	.pcat2-power-table tr:last-child td {
		border-bottom: none;
	}
	.pcat2-power-table td:first-child {
		width: 35%;
		font-weight: 500;
		color: #495057;
	}
	.pcat2-power-value {
		font-family: monospace;
		font-size: 14px;
	}
	.pcat2-battery-bar {
		height: 20px;
		background-color: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
		margin-top: 5px;
	}
	.pcat2-battery-fill {
		height: 100%;
		transition: width 0.3s ease;
	}
	.pcat2-section-title {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: #212529;
		padding-bottom: 8px;
		border-bottom: 2px solid #dee2e6;
	}
	.pcat2-thermal-zone {
		background-color: #f8f9fa;
		padding: 10px;
		margin-bottom: 8px;
		border-radius: 4px;
		border-left: 3px solid #007bff;
	}
	.pcat2-thermal-zone-title {
		font-weight: 500;
		margin-bottom: 5px;
	}
</style>
`;

		// 主容器
		html += '<div class="pcat2-power-section">';

		// 电池信息
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">🔋 电池信息</h3>';
		html += '<table class="pcat2-power-table">';

		if (powerInfo.battery) {
			const bat = powerInfo.battery;
			html += `<tr><td>电池容量</td><td>
				<span class="pcat2-power-value">${bat.capacity}%</span>
				<div class="pcat2-battery-bar">
					<div class="pcat2-battery-fill" style="width: ${bat.capacity}%; background-color: ${getBatteryColor(bat.capacity)};"></div>
				</div>
			</td></tr>`;
			html += `<tr><td>电池电压</td><td><span class="pcat2-power-value">${formatVoltage(bat.voltage_now)}</span></td></tr>`;
			html += `<tr><td>电池电流</td><td><span class="pcat2-power-value">${formatCurrent(bat.current_now)}</span></td></tr>`;
			html += `<tr><td>电池功率</td><td><span class="pcat2-power-value">${formatPower(bat.power_now)}</span></td></tr>`;
		} else {
			html += '<tr><td colspan="2">电池信息不可用</td></tr>';
		}
		html += '</table></div>';

		// 充电器信息
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">🔌 充电器信息</h3>';
		html += '<table class="pcat2-power-table">';

		if (powerInfo.charger) {
			const charger = powerInfo.charger;
			html += `<tr><td>充电状态</td><td><span class="pcat2-power-value">${getChargingStatus(charger.online)}</span></td></tr>`;
			html += `<tr><td>充电电压</td><td><span class="pcat2-power-value">${formatVoltage(charger.voltage_now)}</span></td></tr>`;
		} else {
			html += '<tr><td colspan="2">充电器信息不可用</td></tr>';
		}
		html += '</table></div>';

		// 风扇信息
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">💨 风扇信息</h3>';
		html += '<table class="pcat2-power-table">';

		if (powerInfo.fan) {
			const fan = powerInfo.fan;
			html += `<tr><td>风扇档位</td><td><span class="pcat2-power-value">${getFanStatus(fan.cur_state, fan.max_state)}</span></td></tr>`;
			html += `<tr><td>风扇转速</td><td><span class="pcat2-power-value">${formatRPM(fan.fan_speed)}</span></td></tr>`;
		} else {
			html += '<tr><td colspan="2">风扇信息不可用</td></tr>';
		}
		html += '</table></div>';

		// 主板温度
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">🌡️ 主板温度</h3>';
		html += '<table class="pcat2-power-table">';

		if (powerInfo.motherboard) {
			const mb = powerInfo.motherboard;
			html += `<tr><td>主板温度</td><td><span class="pcat2-power-value">${formatTemp(mb.temp)}</span></td></tr>`;
		} else {
			html += '<tr><td colspan="2">主板温度信息不可用</td></tr>';
		}
		html += '</table></div>';

		// 背光亮度
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">💡 背光亮度</h3>';
		html += '<table class="pcat2-power-table">';

		if (powerInfo.backlight) {
			const bl = powerInfo.backlight;
			html += `<tr><td>背光亮度</td><td><span class="pcat2-power-value">${bl.brightness}</span></td></tr>`;
		} else {
			html += '<tr><td colspan="2">背光信息不可用</td></tr>';
		}
		html += '</table></div>';

		// 热区信息
		html += '<div class="cbi-section">';
		html += '<h3 class="pcat2-section-title">🔥 热区信息</h3>';

		if (powerInfo.thermal_zones && powerInfo.thermal_zones.length > 0) {
			powerInfo.thermal_zones.forEach((zone, index) => {
				html += '<div class="pcat2-thermal-zone">';
				html += `<div class="pcat2-thermal-zone-title">热区 ${index}: ${zone.type}</div>`;
				html += `<div>当前温度: <span class="pcat2-power-value">${formatTemp(zone.temp)}</span></div>`;
				if (zone.trip_point_passive > 0) {
					html += `<div>被动阈值: <span class="pcat2-power-value">${formatTemp(zone.trip_point_passive)}</span></div>`;
				}
				if (zone.trip_point_active > 0) {
					html += `<div>主动阈值: <span class="pcat2-power-value">${formatTemp(zone.trip_point_active)}</span></div>`;
				}
				if (zone.trip_point_critical > 0) {
					html += `<div>临界阈值: <span class="pcat2-power-value">${formatTemp(zone.trip_point_critical)}</span></div>`;
				}
				html += '</div>';
			});
		} else {
			html += '<div>热区信息不可用</div>';
		}
		html += '</div>';

		html += '</div>';

		return html;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
