# SPDX-License-Identifier: GPL-3.0-only
#
# Copyright (C) 2021-2023  sirpdboy  <herboy2008@gmail.com>
# Copyright (C) 2025  zzzz0317  <github-pcat2@zhangzhe.net>
# 
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

PKG_NAME:=pcat2-display-mini
PKG_VERSION:=1.0.0
PKG_RELEASE:=34

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/zzzz0317/photonicat2_mini_display
PKG_SOURCE_DATE:=2026-03-11
PKG_SOURCE_VERSION:=0bebe25502c37ca2f0f311c765ba3e545f83a72d

PKG_LICENSE:=GPL-3.0
PKG_LICENSE_FILES:=LICENSE

PKG_MAINTAINER:=zzzz0317 <github-pcat2@zhangzhe.net>

PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

GO_PKG:=github.com/photonicat/photonicat2_mini_display
GO_PKG_BUILD_PKG:=$(GO_PKG)
GO_PKG_LDFLAGS_X:=main.version=$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/pcat2-display-mini
  TITLE:=Display service for photonicat2
  SECTION:=utils
  CATEGORY:=Utilities
  DEPENDS:=$(GO_ARCH_DEPENDS)
  PROVIDES:=pcat2-display-mini
  URL:=https://github.com/zzzz0317/photonicat2_mini_display
endef

define Package/pcat2-display-mini/description
  Display service for photonicat2.
endef

define Build/Prepare
	$(call Build/Prepare/Default)

	cd $(PKG_BUILD_DIR); go mod tidy
endef

define Package/pcat2-display-mini/install
	$(call GoPackage/Package/Install/Bin,$(1))

	$(INSTALL_DIR) $(1)/etc
	$(INSTALL_DIR) $(1)/usr/share/pcat2_mini_display/assets/fonts
	$(INSTALL_DIR) $(1)/usr/share/pcat2_mini_display/assets/html
	$(INSTALL_DIR) $(1)/usr/share/pcat2_mini_display/assets/svg

	$(INSTALL_DATA) \
		$(PKG_BUILD_DIR)/assets/fonts/*.* \
		$(1)/usr/share/pcat2_mini_display/assets/fonts

	$(INSTALL_DATA) \
		$(PKG_BUILD_DIR)/assets/html/*.* \
		$(1)/usr/share/pcat2_mini_display/assets/html

	$(INSTALL_DATA) \
		$(PKG_BUILD_DIR)/assets/svg/*.* \
		$(1)/usr/share/pcat2_mini_display/assets/svg

# 	$(INSTALL_CONF) $(PKG_BUILD_DIR)/config.json \

	$(INSTALL_CONF) ./files/pcat2_mini_display-config.json \
		$(1)/etc/pcat2_mini_display-config.json

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/pcat2-display-mini \
		$(1)/etc/init.d/pcat2-display-mini
endef

$(eval $(call GoBinPackage,pcat2-display-mini))
$(eval $(call BuildPackage,pcat2-display-mini))