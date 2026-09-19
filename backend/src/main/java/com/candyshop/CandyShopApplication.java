package com.candyshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class CandyShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(CandyShopApplication.class, args);
    }
}
