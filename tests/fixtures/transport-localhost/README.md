# Local transport test certificate

This self-signed certificate and its deliberately public private key are test
fixtures for loopback HTTPS only. They contain no deployment credentials.
The child diagnostic process trusts this certificate through
`NODE_EXTRA_CA_CERTS`; production TLS verification remains enabled.

The certificate covers localhost, 127.0.0.1, and ::1 and expires in 2126.
Never install this test key or certificate on a deployed service.
