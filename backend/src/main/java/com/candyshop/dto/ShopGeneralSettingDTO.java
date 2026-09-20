package com.candyshop.dto;

import java.io.Serializable;

public class ShopGeneralSettingDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    // --- Shop Branding & Titles ---
    private String shopName;
    private String shopTitle;
    private String shopSlogan;

    // --- Header Configuration ---
    private String headerAnnouncement;
    private String headerHotline;

    // --- Footer Configuration ---
    private String footerDescription;
    private String footerAddress;
    private String footerMapsUrl;
    private String footerHotline;
    private String footerWorkingHours;
    private String footerEmail;
    private String footerCopyright;
    private String footerBadge1;
    private String footerBadge2;

    // --- Seasonal Visual Effect ---
    private String activeEffect; // NONE, WINTER_SNOW, SPRING_BLOSSOM, AUTUMN_LEAVES, SUMMER_BUBBLES, CONFETTI_PARTY

    // --- Theme & Appearance (Primary Color & Shop Background) ---
    private String primaryColor;
    private String shopBackgroundPattern;
    private String shopBackgroundImageUrl;
    private Integer shopBackgroundOpacity;
    private String footerBgColor;

    public ShopGeneralSettingDTO() {
    }

    public ShopGeneralSettingDTO(String shopName, String shopTitle, String shopSlogan,
                                 String headerAnnouncement, String headerHotline,
                                 String footerDescription, String footerAddress, String footerMapsUrl,
                                 String footerHotline, String footerWorkingHours, String footerEmail,
                                 String footerCopyright, String footerBadge1, String footerBadge2,
                                 String activeEffect) {
        this(shopName, shopTitle, shopSlogan, headerAnnouncement, headerHotline,
             footerDescription, footerAddress, footerMapsUrl, footerHotline, footerWorkingHours,
             footerEmail, footerCopyright, footerBadge1, footerBadge2, activeEffect,
             "#0f766e", "DEFAULT", "", 15, "THEME_MATCH");
    }

    public ShopGeneralSettingDTO(String shopName, String shopTitle, String shopSlogan,
                                 String headerAnnouncement, String headerHotline,
                                 String footerDescription, String footerAddress, String footerMapsUrl,
                                 String footerHotline, String footerWorkingHours, String footerEmail,
                                 String footerCopyright, String footerBadge1, String footerBadge2,
                                 String activeEffect,
                                 String primaryColor, String shopBackgroundPattern,
                                 String shopBackgroundImageUrl, Integer shopBackgroundOpacity) {
        this(shopName, shopTitle, shopSlogan, headerAnnouncement, headerHotline,
             footerDescription, footerAddress, footerMapsUrl, footerHotline, footerWorkingHours,
             footerEmail, footerCopyright, footerBadge1, footerBadge2, activeEffect,
             primaryColor, shopBackgroundPattern, shopBackgroundImageUrl, shopBackgroundOpacity, "THEME_MATCH");
    }

    public ShopGeneralSettingDTO(String shopName, String shopTitle, String shopSlogan,
                                 String headerAnnouncement, String headerHotline,
                                 String footerDescription, String footerAddress, String footerMapsUrl,
                                 String footerHotline, String footerWorkingHours, String footerEmail,
                                 String footerCopyright, String footerBadge1, String footerBadge2,
                                 String activeEffect,
                                 String primaryColor, String shopBackgroundPattern,
                                 String shopBackgroundImageUrl, Integer shopBackgroundOpacity,
                                 String footerBgColor) {
        this.shopName = shopName;
        this.shopTitle = shopTitle;
        this.shopSlogan = shopSlogan;
        this.headerAnnouncement = headerAnnouncement;
        this.headerHotline = headerHotline;
        this.footerDescription = footerDescription;
        this.footerAddress = footerAddress;
        this.footerMapsUrl = footerMapsUrl;
        this.footerHotline = footerHotline;
        this.footerWorkingHours = footerWorkingHours;
        this.footerEmail = footerEmail;
        this.footerCopyright = footerCopyright;
        this.footerBadge1 = footerBadge1;
        this.footerBadge2 = footerBadge2;
        this.activeEffect = activeEffect;
        this.primaryColor = primaryColor;
        this.shopBackgroundPattern = shopBackgroundPattern;
        this.shopBackgroundImageUrl = shopBackgroundImageUrl;
        this.shopBackgroundOpacity = shopBackgroundOpacity;
    }


    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getShopTitle() {
        return shopTitle;
    }

    public void setShopTitle(String shopTitle) {
        this.shopTitle = shopTitle;
    }

    public String getShopSlogan() {
        return shopSlogan;
    }

    public void setShopSlogan(String shopSlogan) {
        this.shopSlogan = shopSlogan;
    }

    public String getHeaderAnnouncement() {
        return headerAnnouncement;
    }

    public void setHeaderAnnouncement(String headerAnnouncement) {
        this.headerAnnouncement = headerAnnouncement;
    }

    public String getHeaderHotline() {
        return headerHotline;
    }

    public void setHeaderHotline(String headerHotline) {
        this.headerHotline = headerHotline;
    }

    public String getFooterDescription() {
        return footerDescription;
    }

    public void setFooterDescription(String footerDescription) {
        this.footerDescription = footerDescription;
    }

    public String getFooterAddress() {
        return footerAddress;
    }

    public void setFooterAddress(String footerAddress) {
        this.footerAddress = footerAddress;
    }

    public String getFooterMapsUrl() {
        return footerMapsUrl;
    }

    public void setFooterMapsUrl(String footerMapsUrl) {
        this.footerMapsUrl = footerMapsUrl;
    }

    public String getFooterHotline() {
        return footerHotline;
    }

    public void setFooterHotline(String footerHotline) {
        this.footerHotline = footerHotline;
    }

    public String getFooterWorkingHours() {
        return footerWorkingHours;
    }

    public void setFooterWorkingHours(String footerWorkingHours) {
        this.footerWorkingHours = footerWorkingHours;
    }

    public String getFooterEmail() {
        return footerEmail;
    }

    public void setFooterEmail(String footerEmail) {
        this.footerEmail = footerEmail;
    }

    public String getFooterCopyright() {
        return footerCopyright;
    }

    public void setFooterCopyright(String footerCopyright) {
        this.footerCopyright = footerCopyright;
    }

    public String getFooterBadge1() {
        return footerBadge1;
    }

    public void setFooterBadge1(String footerBadge1) {
        this.footerBadge1 = footerBadge1;
    }

    public String getFooterBadge2() {
        return footerBadge2;
    }

    public void setFooterBadge2(String footerBadge2) {
        this.footerBadge2 = footerBadge2;
    }

    public String getActiveEffect() {
        return activeEffect;
    }

    public void setActiveEffect(String activeEffect) {
        this.activeEffect = activeEffect;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getShopBackgroundPattern() {
        return shopBackgroundPattern;
    }

    public void setShopBackgroundPattern(String shopBackgroundPattern) {
        this.shopBackgroundPattern = shopBackgroundPattern;
    }

    public String getShopBackgroundImageUrl() {
        return shopBackgroundImageUrl;
    }

    public void setShopBackgroundImageUrl(String shopBackgroundImageUrl) {
        this.shopBackgroundImageUrl = shopBackgroundImageUrl;
    }

    public Integer getShopBackgroundOpacity() {
        return shopBackgroundOpacity;
    }

    public void setShopBackgroundOpacity(Integer shopBackgroundOpacity) {
        this.shopBackgroundOpacity = shopBackgroundOpacity;
    }

    public String getFooterBgColor() {
        return footerBgColor;
    }

    public void setFooterBgColor(String footerBgColor) {
        this.footerBgColor = footerBgColor;
    }
}

