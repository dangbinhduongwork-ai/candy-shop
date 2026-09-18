package com.candyshop.security;

import com.candyshop.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.candyshop.entity.UserStatus;
import java.util.Collection;
import java.util.List;

/**
 * Wrapper around our User entity that implements Spring Security's UserDetails interface.
 * Bridges the gap between our User entity and Spring Security's authentication system.
 */
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final UserStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.status = user.getStatus();
        // Map our Role enum to Spring Security GrantedAuthority
        this.authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }

    public Long getId() {
        return id;
    }

    public UserStatus getStatus() {
        return status;
    }

    @Override
    public String getUsername() {
        // We use email as the username identifier
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return status == UserStatus.ACTIVE; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return status == UserStatus.ACTIVE; }
}
