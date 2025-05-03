package org.greencodeinitiative.rules;

import com.sun.net.httpserver.HttpServer;

import java.awt.*;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Map;

import static java.lang.System.Logger.Level.INFO;
import static java.util.Map.entry;
import static java.util.Map.ofEntries;

public class EmbeddedServer {
	private static final System.Logger logger = System.getLogger(EmbeddedServer.class.getName());
	private static final String DEFAULT_CONTENT_TYPE = "text/plain";
	private static final Map<String, String> CONTENT_TYPES = ofEntries(
		entry(".html", "text/html"),
		entry(".htm", "text/html"),
		entry(".xhtml", "application/xhtml+xml"),
		entry(".xml", "application/xml"),

		entry(".js", "text/javascript"),
		entry(".json", "application/json"),

		entry(".css", "text/css"),
		entry(".ttf", "font/ttf"),
		entry(".woff", "font/woff"),
		entry(".woff2", "font/woff2"),

		entry(".svg", "image/svg+xml"),
		entry(".gif", "image/gif"),
		entry(".jpeg", "image/jpeg"),
		entry(".jpg", "image/jpeg"),
		entry(".png", "image/png"),
		entry(".ico", "image/vnd.microsoft.icon"),

		entry(".txt", DEFAULT_CONTENT_TYPE)
	);

	public static void main(String[] args) throws Exception {
		// Utiliser 0 pour obtenir un port libre automatiquement
		HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);

		server.createContext("/", exchange -> {
			String path = exchange.getRequestURI().getPath();
			if ("/".equals(path)) {
				path = "/index.html";
			}
			// charger le fichier depuis le JAR
			try (InputStream resourceStream = EmbeddedServer.class.getResourceAsStream(path)) {
				if (resourceStream == null) {
					exchange.sendResponseHeaders(404, -1);
					return;
				}

				String contentType = getContentType(path);

				exchange.getResponseHeaders().set("Content-Type", contentType);
				byte[] data = resourceStream.readAllBytes();
				exchange.sendResponseHeaders(200, data.length);
				try (OutputStream os = exchange.getResponseBody()) {
					os.write(data);
				}
			}
		});

		server.setExecutor(null);
		server.start();

		var uri = URI.create("http://localhost:" + server.getAddress().getPort());
		logger.log(INFO, "Server started at: {0}", uri);

		if (Desktop.isDesktopSupported()) {
			Desktop.getDesktop().browse(uri);
		}
	}

	/**
	 * Determine the content type based on the file extension.
	 */
	private static String getContentType(String path) {
		// Extract extension from the path
		int lastDotIndex = path.lastIndexOf('.');
		if (lastDotIndex == -1) {
			return DEFAULT_CONTENT_TYPE; // Default content type
		}
		String extension = path.substring(lastDotIndex);
		// Return the content type based on the extension
		return CONTENT_TYPES.getOrDefault(extension, DEFAULT_CONTENT_TYPE);
	}
}
