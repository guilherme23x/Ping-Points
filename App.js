import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Modal,
  Vibration,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
// ======== COMPONENTE DE ALERTA CUSTOMIZADO ========
function ThemedAlert({ config, hideAlert, theme }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={config.visible}
      onRequestClose={hideAlert}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
        <View
          style={{
            width: '100%',
            backgroundColor: theme.surface,
            borderRadius: RADIUS.lg,
            padding: 24,
          }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              fontWeight: '800',
              marginBottom: 10,
            }}>
            {config.title}
          </Text>
          <Text
            style={{
              color: theme.subText,
              fontSize: 16,
              lineHeight: 22,
              marginBottom: 28,
            }}>
            {config.message}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
            }}>
            {config.buttons?.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    hideAlert(); // Fecha o modal primeiro
                    if (btn.onPress) setTimeout(btn.onPress, 50); // Executa a ação
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: RADIUS.md,
                    backgroundColor: isDestructive
                      ? theme.isDark
                        ? theme.danger + '25'
                        : theme.danger + '15'
                      : theme.surfaceAlt,
                  }}>
                  <Text
                    style={{
                      color: isDestructive ? theme.danger : theme.text,
                      fontWeight: '800',
                      fontSize: 14,
                    }}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const STORAGE_KEYS = {
  ATHLETES: '@arena:athletes',
  HISTORY: '@arena:history',
  THEME: '@arena:theme',
};

// ======== TEMAS ========
const DARK_THEME = {
  isDark: true,
  bg: '#121820',
  surface: '#1A212D',
  surfaceAlt: '#232C3A',
  accent: '#1ED7C7',
  text: '#FDFEFF',
  subText: '#7B899E',
  border: '#273142',
  danger: '#F84B68',
};

const LIGHT_THEME = {
  isDark: false,
  bg: '#F3F6F9',
  surface: '#FFFFFF',
  surfaceAlt: '#E2E8F0',
  accent: '#0D9488', // Mais escuro para melhor contraste no claro
  text: '#0F172A',
  subText: '#64748B',
  border: '#CBD5E1',
  danger: '#E11D48',
};

const RADIUS = { sm: 10, md: 16, lg: 22, pill: 99 };
const REQUIRED_PLAYERS = 2;

// Geração visual sem cor de fundo fixa, adaptável aos dois temas
const AVATAR_SEEDS = [
  // === ESQUADRÃO 1: VIPER ===
  'Viper&baseColor=F84B68', // Vermelho Alerta
  'Viper&baseColor=1ED7C7', // Ciano Neon
  'Viper&baseColor=A855F7', // Roxo Void
  'Viper&baseColor=FACC15', // Amarelo Faísca
  'Viper&baseColor=4ADE80', // Verde Tóxico
  'Viper&baseColor=3B82F6', // Azul Profundo
  'Viper&baseColor=F8FAFC', // Prata Titanium

  // === ESQUADRÃO 2: NOVA ===
  'Nova&baseColor=F84B68',
  'Nova&baseColor=1ED7C7',
  'Nova&baseColor=A855F7',
  'Nova&baseColor=FACC15',
  'Nova&baseColor=4ADE80',
  'Nova&baseColor=3B82F6',
  'Nova&baseColor=F8FAFC',

  // === ESQUADRÃO 3: ATLAS ===
  'Atlas&baseColor=F84B68',
  'Atlas&baseColor=1ED7C7',
  'Atlas&baseColor=A855F7',
  'Atlas&baseColor=FACC15',
  'Atlas&baseColor=4ADE80',
  'Atlas&baseColor=3B82F6',
  'Atlas&baseColor=F8FAFC',

  // === ESQUADRÃO 4: ZERO ===
  'Zero&baseColor=F84B68',
  'Zero&baseColor=1ED7C7',
  'Zero&baseColor=A855F7',
  'Zero&baseColor=FACC15',
  'Zero&baseColor=4ADE80',
  'Zero&baseColor=3B82F6',
  'Zero&baseColor=F8FAFC',

  // === ESQUADRÃO 5: ORACLE ===
  'Oracle&baseColor=F84B68',
  'Oracle&baseColor=1ED7C7',
  'Oracle&baseColor=A855F7',
  'Oracle&baseColor=FACC15',
  'Oracle&baseColor=4ADE80',
  'Oracle&baseColor=3B82F6',
  'Oracle&baseColor=F8FAFC',

  // === ESQUADRÃO 6: WRAITH ===
  'Wraith&baseColor=F84B68',
  'Wraith&baseColor=1ED7C7',
  'Wraith&baseColor=A855F7',
  'Wraith&baseColor=FACC15',
  'Wraith&baseColor=4ADE80',
  'Wraith&baseColor=3B82F6',
  'Wraith&baseColor=F8FAFC',

  // === ESQUADRÃO 7: MATRIX ===
  'Matrix&baseColor=F84B68',
  'Matrix&baseColor=1ED7C7',
  'Matrix&baseColor=A855F7',
  'Matrix&baseColor=FACC15',
  'Matrix&baseColor=4ADE80',
  'Matrix&baseColor=3B82F6',
  'Matrix&baseColor=F8FAFC',

  // === ESQUADRÃO 8: ECHO ===
  'Echo&baseColor=F84B68',
  'Echo&baseColor=1ED7C7',
  'Echo&baseColor=A855F7',
  'Echo&baseColor=FACC15',
  'Echo&baseColor=4ADE80',
  'Echo&baseColor=3B82F6',
  'Echo&baseColor=F8FAFC',

  // === ESQUADRÃO 9: APEX ===
  'Apex&baseColor=F84B68',
  'Apex&baseColor=1ED7C7',
  'Apex&baseColor=A855F7',
  'Apex&baseColor=FACC15',
  'Apex&baseColor=4ADE80',
  'Apex&baseColor=3B82F6',
  'Apex&baseColor=F8FAFC',

  // === ESQUADRÃO 10: ONYX ===
  'Onyx&baseColor=F84B68',
  'Onyx&baseColor=1ED7C7',
  'Onyx&baseColor=A855F7',
  'Onyx&baseColor=FACC15',
  'Onyx&baseColor=4ADE80',
  'Onyx&baseColor=3B82F6',
  'Onyx&baseColor=F8FAFC',
];
const DEFAULT_SKINS = AVATAR_SEEDS.map(
  (seed) => `https://api.dicebear.com/7.x/bottts/png?seed=${seed}`
);

const CONFIG_SPRING = LayoutAnimation.create(
  350,
  LayoutAnimation.Types.spring,
  LayoutAnimation.Properties.scaleXY
);

// ======== LÓGICA BASE ========
const getProfile = (id, list) =>
  list.find((a) => a.id === id) || { name: 'Player', avatar: DEFAULT_SKINS[0] };

const resolveWinner1v1 = (scores, targetPoints) => {
  if (scores[0] >= targetPoints && scores[0] - scores[1] >= 2) return 0;
  if (scores[1] >= targetPoints && scores[1] - scores[0] >= 2) return 1;
  return -1;
};

const initGameState = (pIds, tPoints, tSets) => ({
  teams: [pIds[0], pIds[1]],
  scores: [0, 0],
  setsWon: [0, 0],
  setHistory: [],
  targetPoints: tPoints,
  targetSets: tSets,
  isFinished: false,
  winnerIndex: null,
});

function useSpringPress() {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
  }, [scale]);
  return { scale, pressIn, pressOut };
}

// ======== ELEMENTOS VISUAIS COMUNS ========
function SectionTitle({ title, subTitle, theme }) {
  return (
    <View style={{ marginBottom: 24, marginTop: 10, paddingHorizontal: 20 }}>
      <Text
        style={{
          color: theme.text,
          fontSize: 32,
          fontWeight: '800',
          letterSpacing: -1,
        }}>
        {title}
      </Text>
      <View
        style={{
          width: 45,
          height: 4,
          backgroundColor: theme.accent,
          borderRadius: RADIUS.pill,
          marginTop: 8,
        }}
      />
      {subTitle && (
        <Text style={{ color: theme.subText, fontSize: 13, marginTop: 10 }}>
          {subTitle}
        </Text>
      )}
    </View>
  );
}

function MainButton({ label, disabled, onPress, theme }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? theme.surfaceAlt : theme.accent,
        paddingVertical: 18,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
      }}>
      <Text
        style={{
          color: disabled ? theme.subText : theme.bg,
          fontWeight: '900',
          fontSize: 14,
          letterSpacing: 2,
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ======== TELA/FLUXO DO ATLETA ========
function ScreenAthletes({ playersList, setPlayersList, theme, showAlert }) {
  const [newAthleteName, setNewAthleteName] = useState('');
  const [activeSkinIdx, setActiveSkinIdx] = useState(0);

  const saveAthlete = () => {
    const nomeBase = newAthleteName.trim();
    if (!nomeBase) return;

    LayoutAnimation.configureNext(CONFIG_SPRING);
    const atleta = {
      id: Date.now().toString(),
      name: nomeBase,
      avatar: DEFAULT_SKINS[activeSkinIdx],
    };
    const listaAjustada = [atleta, ...playersList];

    setPlayersList(listaAjustada);
    AsyncStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(listaAjustada));
    setNewAthleteName('');
    Vibration.vibrate(20);
  };

  const apagarAthlete = (idExclusao, nomeExclusao) => {
    showAlert(
      'Remover Registro!',
      `Limpar definitivamente o log para [${nomeExclusao}]?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Sim, Expurgue',
          style: 'destructive',
          onPress: () => {
            const filtrados = playersList.filter((j) => j.id !== idExclusao);
            setPlayersList(filtrados);
            AsyncStorage.setItem(
              STORAGE_KEYS.ATHLETES,
              JSON.stringify(filtrados)
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 45 : 30 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={playersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}
        keyExtractor={(v) => v.id}
        ListHeaderComponent={
          <View>
            <SectionTitle
              title="Jogadores"
              subTitle="Base completa de criação dos rostos locais da arena."
              theme={theme}
            />
            <View
              style={{
                backgroundColor: theme.surface,
                padding: 20,
                borderRadius: RADIUS.lg,
                marginBottom: 25,
              }}>
              <TextInput
                placeholder="Nome"
                placeholderTextColor={theme.subText}
                value={newAthleteName}
                onChangeText={setNewAthleteName}
                style={{
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                  fontSize: 18,
                  fontWeight: '700',
                  paddingVertical: 14,
                  marginBottom: 24,
                }}
              />
              <Text
                style={{
                  color: theme.accent,
                  fontSize: 11,
                  fontWeight: '800',
                  marginBottom: 12,
                  letterSpacing: 1,
                }}>
                INSERIR NOVA IMAGEM PERFIL
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}>
                <View
                  style={{
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',
                    height: 165,
                    gap: 10,
                  }}>
                  {DEFAULT_SKINS.map(
                    (imgUriSkinLocal, indexOfMapSkinLocalInt) => (
                      <TouchableOpacity
                        key={indexOfMapSkinLocalInt}
                        onPress={() => {
                          Vibration.vibrate(10);
                          setActiveSkinIdx(indexOfMapSkinLocalInt);
                        }}
                        style={{
                          width: 75,
                          height: 75,
                          marginRight: 10,
                          borderRadius: RADIUS.sm,
                          borderWidth: 3,
                          borderColor:
                            indexOfMapSkinLocalInt === activeSkinIdx
                              ? theme.accent
                              : theme.surfaceAlt,
                          overflow: 'hidden',
                          backgroundColor: theme.surfaceAlt,
                        }}>
                        <Image
                          source={{ uri: imgUriSkinLocal }}
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: theme.surfaceAlt,
                          }}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={saveAthlete}
                style={{
                  backgroundColor: theme.surfaceAlt,
                  paddingVertical: 18,
                  borderRadius: RADIUS.pill,
                  alignItems: 'center',
                  marginTop: 15,
                  opacity: !newAthleteName.trim() ? 0.3 : 1,
                }}>
                <Text
                  style={{
                    color: theme.accent,
                    fontWeight: '900',
                    letterSpacing: 2,
                  }}>
                  Registrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              padding: 14,
              borderRadius: RADIUS.md,
              marginBottom: 12,
            }}>
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: 44,
                height: 44,
                borderRadius: RADIUS.md,
                backgroundColor: theme.surfaceAlt,
                marginRight: 16,
              }}
            />
            <Text
              style={{
                color: theme.text,
                flex: 1,
                fontSize: 16,
                fontWeight: '800',
              }}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => apagarAthlete(item.id, item.name)}
              style={{ padding: 8 }}>
              <Text
                style={{
                  color: theme.subText,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                Deletar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

// ======== TELA DE CONTROLE DA SALA ATIVA ========
function PlayAreaInterface({
  game,
  setGame,
  dbRoster,
  onEndMatch,
  onMatchSuccess,
  theme,
  showAlert,
}) {
  if (game.isFinished) {
    const winnerData = getProfile(game.teams[game.winnerIndex], dbRoster);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
        <Image
          source={{ uri: winnerData.avatar }}
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 6,
            borderColor: theme.accent,
            marginBottom: 30,
            backgroundColor: theme.surfaceAlt,
          }}
        />
        <Text
          style={{
            color: theme.accent,
            fontWeight: '700',
            letterSpacing: 3,
            fontSize: 13,
            marginBottom: 5,
          }}>
          Vencedor
        </Text>
        <Text
          style={{
            color: theme.text,
            fontWeight: '900',
            fontSize: 38,
            textAlign: 'center',
          }}>
          {winnerData.name}
        </Text>
        <Text
          style={{
            color: theme.subText,
            fontSize: 14,
            marginTop: 10,
            marginBottom: 40,
          }}>
          Venceu em Melhor de {game.targetSets}!
        </Text>
        <View style={{ width: '100%', gap: 14 }}>
          <MainButton
            label="Revanche"
            theme={theme}
            onPress={() =>
              setGame(
                initGameState(game.teams, game.targetPoints, game.targetSets)
              )
            }
          />
          <TouchableOpacity
            onPress={onEndMatch}
            style={{ alignItems: 'center', padding: 15 }}>
            <Text style={{ color: theme.subText, fontWeight: '700' }}>
              MENU PRINCIPAL &gt;
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleScore = (idx) => {
    let ns = [...game.scores];
    ns[idx] += 1;
    const idSetWinner = resolveWinner1v1(ns, game.targetPoints);

    if (idSetWinner === -1) {
      setGame({ ...game, scores: ns });
      return;
    }

    const fHistory = [...game.setHistory, ns];
    let finalSetsWon = [...game.setsWon];
    finalSetsWon[idSetWinner] += 1;

    const isWinner = finalSetsWon.findIndex((v) => v >= game.targetSets);

    if (isWinner !== -1) {
      Vibration.vibrate([0, 60, 100, 300]);
      const finalState = {
        ...game,
        scores: [0, 0],
        setHistory: fHistory,
        setsWon: finalSetsWon,
        isFinished: true,
        winnerIndex: isWinner,
      };
      setGame(finalState);
      onMatchSuccess(finalState);
    } else {
      Vibration.vibrate([0, 60, 20]);
      setGame({
        ...game,
        scores: [0, 0],
        setHistory: fHistory,
        setsWon: finalSetsWon,
      });
    }
  };

  const handleMinus = (idx) => {
    let ns = [...game.scores];
    if (ns[idx] > 0) ns[idx] -= 1;
    setGame({ ...game, scores: ns });
  };

  const TapScoreZone = ({ index }) => {
    const score = game.scores[index];
    const data = getProfile(game.teams[index], dbRoster);
    const setsW = game.setsWon[index];
    const isLeading = game.scores[index] > game.scores[1 - index];
    const { scale, pressIn, pressOut } = useSpringPress();

    return (
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}>
        <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() => {
              Vibration.vibrate(15);
              handleScore(index);
            }}
            onLongPress={() => {
              Vibration.vibrate(40);
              handleMinus(index);
            }}
            style={{
              flex: 1,
              borderRadius: RADIUS.lg,
              overflow: 'hidden',
              backgroundColor: theme.surface,
              borderWidth: 2,
              borderColor: isLeading ? theme.accent : 'transparent',
            }}>
            <Image
              source={{ uri: data.avatar }}
              blurRadius={10}
              style={{
                position: 'absolute',
                top: -50,
                bottom: -50,
                right: -50,
                left: -50,
                opacity: 0.1,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: data.avatar }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.md,
                    marginRight: 12,
                    backgroundColor: theme.surfaceAlt,
                  }}
                />
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 17,
                    fontWeight: '800',
                  }}>
                  {data.name}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {Array.from({ length: game.targetSets }).map((_, idb) => (
                  <View
                    key={idb}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: RADIUS.sm,
                      backgroundColor:
                        idb < setsW ? theme.accent : theme.surfaceAlt,
                    }}
                  />
                ))}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: isLeading ? theme.accent : theme.text,
                  fontSize: 180,
                  fontWeight: '800',
                  letterSpacing: -12,
                }}>
                {score}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: Platform.OS === 'ios' ? 60 : 35,
          paddingBottom: 15,
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: theme.subText,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
          }}>
          Vitória c/{' '}
          <Text style={{ color: theme.text }}>{game.targetPoints} Pts</Text> •
          Sets Tgt. <Text style={{ color: theme.text }}>{game.targetSets}</Text>
        </Text>
        <TouchableOpacity
          onPress={() =>
            showAlert('Cancelar Jogo', 'Este andamento será descartado', [
              { text: 'VOLTAR' },
              { text: 'ENCERRAR!', style: 'destructive', onPress: onEndMatch },
            ])
          }
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: theme.surfaceAlt,
            borderRadius: RADIUS.pill,
          }}>
          <Text
            style={{ color: theme.danger, fontSize: 12, fontWeight: '800' }}>
            Abandonar Partida
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingBottom: 30, gap: 6 }}>
        <TapScoreZone index={0} />
        <TapScoreZone index={1} />
      </View>
    </View>
  );
}

// ======== COMPONENTE RAIZ / PRINCIPAL ========
export default function AppMainRoot() {
  const [navTab, setNavTab] = useState('Arena');
  const [playersList, setPlayersList] = useState([]);
  const [matchLog, setMatchLog] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });
  const showAlert = (title, message, buttons) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [targetPoints, setTargetPoints] = useState('11');
  const [targetSets, setTargetSets] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [runningEngine, setRunningEngine] = useState(null);

  const fadeAppBaseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.multiGet([
      STORAGE_KEYS.ATHLETES,
      STORAGE_KEYS.HISTORY,
      STORAGE_KEYS.THEME,
    ]).then(([aK, hK, themeK]) => {
      if (aK[1]) setPlayersList(JSON.parse(aK[1]));
      if (hK[1]) setMatchLog(JSON.parse(hK[1]));
      if (themeK[1]) setIsDarkMode(themeK[1] === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    LayoutAnimation.configureNext(CONFIG_SPRING);
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    AsyncStorage.setItem(STORAGE_KEYS.THEME, newMode ? 'dark' : 'light');
  };

  const routeNav = (tagIdNav) => {
    Animated.timing(fadeAppBaseAnim, {
      toValue: 0,
      duration: 60,
      useNativeDriver: true,
    }).start(() => {
      setNavTab(tagIdNav);
      Animated.timing(fadeAppBaseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const runSaveMatchEngine = (finishedData) => {
    const docToSave = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      teams: finishedData.teams,
      setsWon: finishedData.setsWon,
      setHistory: finishedData.setHistory,
      winnerIndex: finishedData.winnerIndex,
    };
    setMatchLog((prev) => {
      const newHistory = [docToSave, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg,
        paddingTop: Platform.OS === 'ios' ? 45 : StatusBar.currentHeight,
      }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
        translucent={false}
      />

      {runningEngine ? (
        <PlayAreaInterface
          game={runningEngine}
          setGame={setRunningEngine}
          dbRoster={playersList}
          theme={theme}
          showAlert={showAlert}
          onMatchSuccess={runSaveMatchEngine}
          onEndMatch={() => {
            setRunningEngine(null);
            setSelectedIds([]);
          }}
        />
      ) : (
        <>
          <Animated.View style={{ flex: 1, opacity: fadeAppBaseAnim }}>
            {navTab === 'Arena' && (
              <View
                style={{
                  flex: 1,
                  paddingTop: Platform.OS === 'ios' ? 60 : 45,
                }}>
                <SectionTitle
                  title="Mesa Principal"
                  subTitle="Adicione metas para embate e escolha seu rival."
                  theme={theme}
                  showAlert={showAlert}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 15,
                    paddingHorizontal: 20,
                    marginBottom: 30,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: theme.surface,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: RADIUS.md,
                    }}>
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 10,
                        fontWeight: '800',
                      }}>
                      Pontos
                    </Text>
                    <TextInput
                      style={{
                        color: theme.text,
                        fontSize: 26,
                        fontWeight: '800',
                      }}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      value={targetPoints}
                      onChangeText={setTargetPoints}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: theme.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: RADIUS.md,
                    }}>
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 10,
                        fontWeight: '800',
                      }}>
                      Partidas
                    </Text>
                    <TextInput
                      style={{
                        color: theme.accent,
                        fontSize: 26,
                        fontWeight: '800',
                      }}
                      keyboardType="number-pad"
                      selectTextOnFocus
                      value={targetSets}
                      onChangeText={setTargetSets}
                    />
                  </View>
                </View>

                <View
                  style={{
                    marginHorizontal: 20,
                    marginBottom: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.surfaceAlt,
                    borderRadius: RADIUS.pill,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                  }}>
                  <TextInput
                    placeholder="Nome do Jogador..."
                    placeholderTextColor={theme.subText}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={{ flex: 1, color: theme.text, fontSize: 15 }}
                  />
                </View>

                <FlatList
                  data={playersList.filter((o) =>
                    o.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  numColumns={2}
                  keyExtractor={(k) => k.id}
                  contentContainerStyle={{
                    paddingHorizontal: 14,
                    paddingBottom: 150,
                  }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text
                      style={{
                        color: theme.subText,
                        textAlign: 'center',
                        marginTop: 40,
                      }}>
                      Nenhum Jogador Encontrado
                    </Text>
                  }
                  renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          maxWidth: '46.5%',
                          height: 210,
                          margin: 6,
                          borderRadius: RADIUS.lg,
                          backgroundColor: theme.surface,
                          borderWidth: 1.5,
                          borderColor: isSelected ? theme.accent : theme.border,
                          overflow: 'hidden',
                        }}
                        onPress={() => {
                          LayoutAnimation.configureNext(CONFIG_SPRING);
                          Vibration.vibrate(15);
                          setSelectedIds((p) =>
                            p.includes(item.id)
                              ? p.filter((f) => f !== item.id)
                              : p.length >= 2
                                ? [p[1], item.id]
                                : [...p, item.id]
                          );
                        }}>
                        {isSelected && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              backgroundColor: theme.accent,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: RADIUS.pill,
                              zIndex: 10,
                            }}>
                            <Text
                              style={{
                                color: isDarkMode ? theme.bg : '#FFF',
                                fontWeight: '900',
                                fontSize: 10,
                              }}>
                              P {selectedIds.indexOf(item.id) + 1}
                            </Text>
                          </View>
                        )}
                        <Image
                          source={{ uri: item.avatar }}
                          style={{
                            width: '100%',
                            height: '80%',
                            opacity: isSelected ? 1 : 0.6,
                            backgroundColor: theme.surfaceAlt,
                          }}
                          resizeMode="cover"
                        />
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            height: '50%',
                            opacity: isSelected ? 1 : 0.7,
                            justifyContent: 'flex-end',
                            paddingBottom: 16,
                          }}>
                          <View
                            style={{
                              ...StyleSheet.absoluteFillObject,
                              backgroundColor: isSelected
                                ? isDarkMode
                                  ? 'rgba(30,215,199,0.1)'
                                  : 'rgba(13,148,136,0.1)'
                                : theme.surface,
                              borderTopLeftRadius: 40,
                              top: 35,
                            }}
                          />
                          <Text
                            numberOfLines={1}
                            style={{
                              color: isSelected ? theme.accent : theme.text,
                              fontSize: 15,
                              fontWeight: '800',
                              textAlign: 'center',
                              marginTop: 'auto',
                            }}>
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />

                <View
                  style={{
                    position: 'absolute',
                    width: '100%',
                    paddingHorizontal: '10%',
                    bottom: Platform.OS === 'ios' ? 110 : 90,
                    left: 0,
                    right: 0,
                  }}>
                  <MainButton
                    label={
                      selectedIds.length === 2
                        ? 'Começar >'
                        : 'Selecione os Jogadores'
                    }
                    disabled={selectedIds.length !== 2}
                    theme={theme}
                    onPress={() =>
                      setRunningEngine(
                        initGameState(
                          selectedIds,
                          parseInt(targetPoints) || 11,
                          parseInt(targetSets) || 1
                        )
                      )
                    }
                  />
                </View>
              </View>
            )}

            {navTab === 'Atletas' && (
              <ScreenAthletes
                playersList={playersList}
                setPlayersList={setPlayersList}
                theme={theme}
              />
            )}

            {navTab === 'Historico' && (
              <View
                style={{
                  flex: 1,
                  paddingTop: Platform.OS === 'ios' ? 45 : 30,
                }}>
                <SectionTitle title="Histórico" theme={theme} />
                <FlatList
                  data={matchLog}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 150,
                  }}
                  keyExtractor={(n) => n.id}
                  ListEmptyComponent={
                    <Text
                      style={{
                        color: theme.subText,
                        textAlign: 'center',
                        padding: 40,
                      }}>
                      Histórico Vazio.
                    </Text>
                  }
                  renderItem={({ item }) => {
                    const winnerProfile = getProfile(
                      item.teams[item.winnerIndex],
                      playersList
                    );
                    return (
                      <View
                        style={{
                          backgroundColor: theme.surface,
                          borderRadius: RADIUS.lg,
                          marginBottom: 15,
                          overflow: 'hidden',
                        }}>
                        <View
                          style={{
                            backgroundColor: isDarkMode
                              ? theme.accent + '11'
                              : theme.surfaceAlt,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={{ uri: winnerProfile.avatar }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.pill,
                              marginRight: 15,
                              backgroundColor: theme.surfaceAlt,
                            }}
                          />
                          <View>
                            <Text
                              style={{
                                color: theme.text,
                                fontWeight: '300',
                                fontSize: 15,
                              }}>
                              O Vencedor{' '}
                              <Text
                                style={{
                                  color: theme.text,
                                  fontWeight: '800',
                                  fontSize: 15,
                                  textTransform: 'uppercase',
                                }}>
                                {winnerProfile.name}
                              </Text>
                            </Text>
                            <Text
                              style={{
                                color: theme.subText,
                                fontSize: 10,
                                marginTop: 4,
                              }}>
                              {new Date(item.date).toLocaleDateString()}{' '}
                              {new Date(item.date)
                                .toLocaleTimeString()
                                .slice(0, 5)}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            paddingHorizontal: 20,
                            paddingVertical: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          {item.teams.map((tId, idx) => (
                            <Text
                              key={tId}
                              style={{
                                color:
                                  idx === item.winnerIndex
                                    ? theme.text
                                    : theme.subText,
                                fontWeight: '700',
                                fontSize: 13,
                              }}>
                              <Text style={{ fontSize: 15 }}>
                                {' '}
                                {getProfile(tId, playersList).name}
                              </Text>{' '}
                              = {item.setsWon[idx]} vts
                            </Text>
                          ))}
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            )}

            {navTab === 'Sistemas' && (
              <ScrollView
                style={{
                  flex: 1,
                  paddingTop: Platform.OS === 'ios' ? 45 : 30,
                }}>
                <SectionTitle title="Configurações" theme={theme} />

                <View style={{ paddingHorizontal: 20 }}>
                  {/* NOVO: ALTERNADOR DE MODO CLARO / ESCURO */}
                  <View
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: RADIUS.lg,
                      padding: 22,
                      marginBottom: 25,
                    }}>
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 11,
                        fontWeight: '800',
                        marginBottom: 20,
                      }}>
                      Aparência
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                        Modo de Exibição
                      </Text>
                      <TouchableOpacity
                        onPress={toggleTheme}
                        style={{
                          backgroundColor: theme.surfaceAlt,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: RADIUS.pill,
                        }}>
                        <Text
                          style={{
                            color: theme.accent,
                            fontWeight: '800',
                            fontSize: 14,
                          }}>
                          {isDarkMode ? 'Escuro' : 'Claro'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: RADIUS.lg,
                      padding: 22,
                      marginBottom: 25,
                    }}>
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 11,
                        fontWeight: '800',
                        marginBottom: 20,
                      }}>
                      Dados
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderColor: theme.border,
                        paddingBottom: 15,
                        marginBottom: 15,
                      }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                        Quantos Jogadores
                      </Text>
                      <View
                        style={{
                          backgroundColor: theme.surfaceAlt,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: RADIUS.pill,
                        }}>
                        <Text
                          style={{
                            color: theme.accent,
                            fontWeight: '900',
                            fontSize: 16,
                          }}>
                          {playersList.length}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 16,
                          fontWeight: '600',
                        }}>
                        Total de Jogadas
                      </Text>
                      <View
                        style={{
                          backgroundColor: theme.surfaceAlt,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: RADIUS.pill,
                        }}>
                        <Text
                          style={{
                            color: theme.text,
                            fontWeight: '900',
                            fontSize: 16,
                          }}>
                          {matchLog.length}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: RADIUS.lg,
                      overflow: 'hidden',
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        showAlert(
                          '⚠ Deletar todos os dados',
                          'Será apagado históricos e criação de jogadores. Deseja continuar?',
                          [
                            { text: 'Cancelar' },
                            {
                              text: 'Deletar Dados',
                              style: 'destructive',
                              onPress: async () => {
                                await AsyncStorage.multiRemove([
                                  STORAGE_KEYS.HISTORY,
                                  STORAGE_KEYS.ATHLETES,
                                ]);
                                setMatchLog([]);
                                setPlayersList([]);
                                setSelectedIds([]);
                                Vibration.vibrate(800);
                              },
                            },
                          ]
                        )
                      }
                      style={{
                        padding: 24,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isDarkMode
                          ? theme.danger + '10'
                          : theme.danger + '20',
                      }}>
                      <Text
                        style={{
                          color: theme.danger,
                          fontWeight: '800',
                          fontSize: 16,
                        }}>
                        Deletar todos os dados{' '}
                      </Text>
                      <Text style={{ color: theme.danger, fontSize: 20 }}>
                        ♻
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </Animated.View>

          <View
            style={{
              position: 'absolute',
              width: '80%',
              justifyContent: 'center',
              bottom: Platform.OS === 'ios' ? 40 : 25,
              alignSelf: 'center',
              flexDirection: 'row',
              backgroundColor: isDarkMode
                ? 'rgba(35, 44, 58, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderRadius: RADIUS.pill,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1.5,
              borderColor: theme.surfaceAlt,
            }}>
            {[
              { tag: 'Arena', iconName: 'search' },
              { tag: 'Atletas', iconName: 'users' },
              { tag: 'Historico', iconName: 'clock' },
              { tag: 'Sistemas', iconName: 'settings' },
            ].map((tab) => {
              const isActive = navTab === tab.tag;
              return (
                <TouchableOpacity
                  key={tab.tag}
                  onPress={() => routeNav(tab.tag)}
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 8,
                    alignItems: 'center',
                  }}>
                  <Feather
                    name={tab.iconName}
                    size={24}
                    color={isActive ? theme.accent : theme.subText}
                    style={{ opacity: isActive ? 1 : 0.4 }}
                  />
                  {isActive && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 2,
                        width: 14,
                        height: 4,
                        backgroundColor: theme.accent,
                        borderRadius: RADIUS.pill,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <ThemedAlert config={alertConfig} hideAlert={hideAlert} theme={theme} />
    </View>
  );
}
