--[[
LuCI PCAT2 Power Status Controller
]]--
module("luci.controller.pcat2", package.seeall)

function index()
	-- 在状态菜单下添加电源信息页面
	local page = entry({"admin", "status", "pcat2_power"}, template("admin_status/index/pcat2_power"), _("电源信息"))
	page.dependent = false
	page.leaf = true
	page.acl_depends = { "luci-app-pcat2" }
end
