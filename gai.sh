#!/usr/bin/env bash

# modify gai.conf to use ipv4 for telegram api 

cat > /etc/gai.conf << EOF
precedence  ::1/128       50
precedence  ::/0          40
precedence  2002::/16     30
precedence ::/96          20
precedence ::ffff:0:0/96  100
EOF