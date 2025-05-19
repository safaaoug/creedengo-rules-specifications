package org.greencodeinitiative.tools.exporter.infra;

public class ProcessException extends RuntimeException {
	public ProcessException(Throwable cause) {
		super(cause);
	}

	public ProcessException(String message, Throwable cause) {
		super(message, cause);
	}
}
