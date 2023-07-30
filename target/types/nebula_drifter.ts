export type NebulaDrifter = {
  "version": "0.1.0",
  "name": "nebula_drifter",
  "instructions": [
    {
      "name": "initGameStateForPlayer",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addResources",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ore",
          "type": "u16"
        },
        {
          "name": "crystal",
          "type": "u16"
        },
        {
          "name": "platinum",
          "type": "u16"
        }
      ]
    },
    {
      "name": "upgrade",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ore",
          "type": "u16"
        },
        {
          "name": "crystal",
          "type": "u16"
        },
        {
          "name": "platinum",
          "type": "u16"
        }
      ]
    },
    {
      "name": "reset",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "ore",
            "type": "u16"
          },
          {
            "name": "crystal",
            "type": "u16"
          },
          {
            "name": "platinum",
            "type": "u16"
          },
          {
            "name": "upgradeLevel",
            "type": "u8"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongPlayer",
      "msg": "Player and signer do not match"
    }
  ]
};

export const IDL: NebulaDrifter = {
  "version": "0.1.0",
  "name": "nebula_drifter",
  "instructions": [
    {
      "name": "initGameStateForPlayer",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addResources",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ore",
          "type": "u16"
        },
        {
          "name": "crystal",
          "type": "u16"
        },
        {
          "name": "platinum",
          "type": "u16"
        }
      ]
    },
    {
      "name": "upgrade",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ore",
          "type": "u16"
        },
        {
          "name": "crystal",
          "type": "u16"
        },
        {
          "name": "platinum",
          "type": "u16"
        }
      ]
    },
    {
      "name": "reset",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "ore",
            "type": "u16"
          },
          {
            "name": "crystal",
            "type": "u16"
          },
          {
            "name": "platinum",
            "type": "u16"
          },
          {
            "name": "upgradeLevel",
            "type": "u8"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongPlayer",
      "msg": "Player and signer do not match"
    }
  ]
};
