package com.course.webchat;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
@OpenAPIDefinition(info = @Info(title = "Web-chat project",
		description = "This is learning project for university", version = "1.0.0",
		license = @License(name = "license", url = "license"),
		contact = @Contact(name = "Stanislav Karashchuk", email = "stanislav.karashchuk@gmail.com")),
		servers = @Server(url = "http://localhost:8080"),
		tags = {@Tag(name = "Messages",
				description = "This is controller to send, edit, delete messages")})
public class WebchatApplication {
	public static void main(String[] args) {
		SpringApplication.run(WebchatApplication.class, args);
	}

}
